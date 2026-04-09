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
 * Apache Lucene in-memory duplicate detection.
 * 
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

    @Transactional(readOnly = true)
    public synchronized void rebuildIndex() throws IOException {
        IndexWriterConfig config = new IndexWriterConfig(analyzer);
        config.setOpenMode(IndexWriterConfig.OpenMode.CREATE);
        try (IndexWriter writer = new IndexWriter(luceneDir, config)) {
            for (Ticket t : ticketRepository.findByStatusIn(OPEN_STATUSES)) {
                writer.addDocument(toDocument(t));
            }
        }
    }

    public synchronized void indexTicket(Ticket ticket) throws IOException {
        if (!OPEN_STATUSES.contains(ticket.status()))
            return;
        IndexWriterConfig config = new IndexWriterConfig(analyzer);
        config.setOpenMode(IndexWriterConfig.OpenMode.APPEND);
        try (IndexWriter writer = new IndexWriter(luceneDir, config)) {
            writer.addDocument(toDocument(ticket));
        }
    }

    public synchronized void removeFromIndex(String ticketId) throws IOException {
        IndexWriterConfig config = new IndexWriterConfig(analyzer);
        config.setOpenMode(IndexWriterConfig.OpenMode.APPEND);
        try (IndexWriter writer = new IndexWriter(luceneDir, config)) {
            writer.deleteDocuments(new Term("id", ticketId));
        }
    }

    /**
     * Fix #8 — search across description + location + domainId.
     */
    public List<DuplicateSuggestion> findSimilar(
            String description, String location, String domainId, String excludeId) throws Exception {

        List<DuplicateSuggestion> results = new ArrayList<>();

        if ((description == null || description.isBlank())
                && (location == null || location.isBlank())) {
            return results;
        }

        try (DirectoryReader reader = DirectoryReader.open(luceneDir)) {
            IndexSearcher searcher = new IndexSearcher(reader);
            BooleanQuery.Builder qb = new BooleanQuery.Builder();

            // Description — primary, boosted ×2
            if (description != null && !description.isBlank()) {
                QueryParser dp = new QueryParser("description", analyzer);
                dp.setDefaultOperator(QueryParser.Operator.OR);
                try {
                    qb.add(new BoostQuery(dp.parse(QueryParser.escape(description.trim())), 2.0f),
                            BooleanClause.Occur.SHOULD);
                } catch (Exception ignored) {
                    /* malformed query — skip */ }
            }

            // Location — secondary, boosted ×1.5
            if (location != null && !location.isBlank()) {
                QueryParser lp = new QueryParser("location", analyzer);
                lp.setDefaultOperator(QueryParser.Operator.OR);
                try {
                    qb.add(new BoostQuery(lp.parse(QueryParser.escape(location.trim())), 1.5f),
                            BooleanClause.Occur.SHOULD);
                } catch (Exception ignored) {
                    /* malformed query — skip */ }
            }

            // Domain — soft match (SHOULD, not MUST so cross-domain still returns results)
            if (domainId != null && !domainId.isBlank()) {
                qb.add(new TermQuery(new Term("domainId", domainId.trim())),
                        BooleanClause.Occur.SHOULD);
            }

            BooleanQuery query = qb.build();
            if (query.clauses().isEmpty())
                return results;

            TopDocs hits = searcher.search(query, MAX_RESULTS + 1);
            for (ScoreDoc sd : hits.scoreDocs) {
                Document doc = searcher.storedFields().document(sd.doc);
                String hitId = doc.get("id");
                if (hitId.equals(excludeId))
                    continue;
                String rawDesc = doc.get("description");
                String snippet = rawDesc != null
                        ? rawDesc.substring(0, Math.min(80, rawDesc.length()))
                        : "";
                results.add(new DuplicateSuggestion(
                        java.util.UUID.fromString(hitId),
                        doc.get("location"),
                        snippet,
                        doc.get("status"),
                        sd.score));
                if (results.size() >= MAX_RESULTS)
                    break;
            }
        }
        return results;
    }

    /** Backward-compatible overload (description-only). */
    public List<DuplicateSuggestion> findSimilar(String description, String excludeId) throws Exception {
        return findSimilar(description, null, null, excludeId);
    }

    private Document toDocument(Ticket t) {
        Document doc = new Document();
        doc.add(new StringField("id", t.id().toString(), Field.Store.YES));
        doc.add(new TextField("description", t.description(), Field.Store.YES));
        doc.add(new TextField("location", t.location(), Field.Store.YES));
        doc.add(new StoredField("status", t.status().name()));
        if (t.domainId() != null) {
            doc.add(new StringField("domainId", t.domainId().toString(), Field.Store.YES));
        }
        return doc;
    }
}