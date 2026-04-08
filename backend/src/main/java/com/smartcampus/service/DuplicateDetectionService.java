package com.smartcampus.service;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.repository.TicketRepository;
import jakarta.annotation.PostConstruct;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.*;
import org.apache.lucene.index.*;
import org.apache.lucene.store.ByteBuffersDirectory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;

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

    /**
     * Rebuild the full Lucene index from the DB.
     */
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

    /** Index a single newly created ticket. */
    public synchronized void indexTicket(Ticket ticket) throws IOException {
        if (!OPEN_STATUSES.contains(ticket.status()))
            return;
        IndexWriterConfig config = new IndexWriterConfig(analyzer);
        config.setOpenMode(IndexWriterConfig.OpenMode.APPEND);
        try (IndexWriter writer = new IndexWriter(luceneDir, config)) {
            writer.addDocument(toDocument(ticket));
        }
    }

    /** Remove a ticket from the index (e.g. when closed/resolved). */
    public synchronized void removeFromIndex(String ticketId) throws IOException {
        IndexWriterConfig config = new IndexWriterConfig(analyzer);
        config.setOpenMode(IndexWriterConfig.OpenMode.APPEND);
        try (IndexWriter writer = new IndexWriter(luceneDir, config)) {
            writer.deleteDocuments(new Term("id", ticketId));
        }
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
