package com.smartcampus.service;

import com.smartcampus.dto.DuplicateSuggestion;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.repository.TicketRepository;
import jakarta.annotation.PostConstruct;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.*;
import org.apache.lucene.index.*;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.*;
import org.apache.lucene.store.ByteBuffersDirectory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Uses Apache Lucene to perform in-memory similarity search over open tickets.
 */
@Service
public class DuplicateDetectionService {

    private static final int MAX_RESULTS = 5;
    private static final List<TicketStatus> OPEN_STATUSES = List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS);

    private final TicketRepository ticketRepository;

    private ByteBuffersDirectory luceneDir;
    private StandardAnalyzer analyzer;

    public DuplicateDetectionService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @PostConstruct
    public void buildIndex() throws IOException {
        luceneDir = new ByteBuffersDirectory();
        analyzer = new StandardAnalyzer();
        rebuildIndex();
    }

    // Rebuild the full Lucene index from the DB (call after restart or bulk
    // changes).

    @Transactional(readOnly = true)
    public synchronized void rebuildIndex() throws IOException {
        IndexWriterConfig config = new IndexWriterConfig(analyzer);
        config.setOpenMode(IndexWriterConfig.OpenMode.CREATE);
        try (IndexWriter writer = new IndexWriter(luceneDir, config)) {
            List<Ticket> openTickets = ticketRepository.findByStatusIn(OPEN_STATUSES);
            for (Ticket t : openTickets) {
                writer.addDocument(toDocument(t));
            }
        }
    }

    // Index a single newly created ticket.
    public synchronized void indexTicket(Ticket ticket) throws IOException {
        if (!OPEN_STATUSES.contains(ticket.status()))
            return;
        IndexWriterConfig config = new IndexWriterConfig(analyzer);
        config.setOpenMode(IndexWriterConfig.OpenMode.APPEND);
        try (IndexWriter writer = new IndexWriter(luceneDir, config)) {
            writer.addDocument(toDocument(ticket));
        }
    }

    // Remove a ticket from the index (when closed/resolved).
    public synchronized void removeFromIndex(String ticketId) throws IOException {
        IndexWriterConfig config = new IndexWriterConfig(analyzer);
        config.setOpenMode(IndexWriterConfig.OpenMode.APPEND);
        try (IndexWriter writer = new IndexWriter(luceneDir, config)) {
            writer.deleteDocuments(new Term("id", ticketId));
        }
    }

    // Search for open tickets similar to the given description.

    public List<DuplicateSuggestion> findSimilar(String description, String excludeId) throws Exception {
        List<DuplicateSuggestion> results = new ArrayList<>();
        if (description == null || description.isBlank())
            return results;

        try (DirectoryReader reader = DirectoryReader.open(luceneDir)) {
            IndexSearcher searcher = new IndexSearcher(reader);
            QueryParser parser = new QueryParser("description", analyzer);
            parser.setDefaultOperator(QueryParser.Operator.OR);

            // Escape special Lucene chars from user input
            String escaped = QueryParser.escape(description.trim());
            Query query = parser.parse(escaped);

            TopDocs hits = searcher.search(query, MAX_RESULTS + 1);
            for (ScoreDoc sd : hits.scoreDocs) {
                Document doc = searcher.storedFields().document(sd.doc);
                String id = doc.get("id");
                if (id.equals(excludeId))
                    continue;
                results.add(new DuplicateSuggestion(
                        java.util.UUID.fromString(id),
                        doc.get("location"),
                        doc.get("description"),
                        doc.get("status"),
                        sd.score));
                if (results.size() == MAX_RESULTS)
                    break;
            }
        }
        return results;
    }

    private Document toDocument(Ticket t) {
        Document doc = new Document();
        doc.add(new StringField("id", t.id().toString(), Field.Store.YES));
        doc.add(new TextField("description", t.description(), Field.Store.YES));
        doc.add(new StoredField("location", t.location()));
        doc.add(new StoredField("status", t.status().name()));
        return doc;
    }
}