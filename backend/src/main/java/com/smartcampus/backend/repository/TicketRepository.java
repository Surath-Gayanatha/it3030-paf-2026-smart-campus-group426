package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Ticket;
import com.smartcampus.backend.model.TicketPriority;
import com.smartcampus.backend.model.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {

    List<Ticket> findByCreatedBy(String createdBy);

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByPriority(TicketPriority priority);

    List<Ticket> findByStatusAndPriority(TicketStatus status, TicketPriority priority);

    List<Ticket> findByAssignedTechnician(String technician);
    List<Ticket> findByAssignedTechnicianId(String assignedTechnicianId);
    List<Ticket> findByCreatedByAndStatus(String createdBy, TicketStatus status);
}
