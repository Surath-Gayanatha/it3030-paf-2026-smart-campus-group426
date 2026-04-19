package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Comment;
import com.smartcampus.backend.model.NotificationType;
import com.smartcampus.backend.repository.CommentRepository;
import com.smartcampus.backend.repository.TicketRepository;
import com.smartcampus.backend.services.NotificationService;
import com.smartcampus.backend.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final NotificationService notificationService;
    private final TicketRepository ticketRepository;
    private final UserService userService;

    public List<Comment> getCommentsByTicketId(String ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public Comment addComment(Comment comment) {
        Comment savedComment = commentRepository.save(comment);

        ticketRepository.findById(savedComment.getTicketId()).ifPresent(ticket -> {
            if (!savedComment.getAuthorEmail().equals(ticket.getCreatedBy())) {
                userService.findByEmail(ticket.getCreatedBy()).ifPresent(owner ->
                        notificationService.createNotification(
                                owner.getId(),
                                "New Comment on Your Ticket",
                                "Someone commented on your ticket: Ticket #" + ticket.getId().substring(Math.max(0, ticket.getId().length() - 5)),
                                NotificationType.NEW_COMMENT,
                                ticket.getId()
                        )
                );
            }
        });

        return savedComment;
    }

    public void deleteComment(String id, String userEmail, boolean isAdmin) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (isAdmin || comment.getAuthorEmail().equals(userEmail)) {
            commentRepository.deleteById(id);
        } else {
            throw new RuntimeException("Unauthorized to delete this comment");
        }
    }
}
