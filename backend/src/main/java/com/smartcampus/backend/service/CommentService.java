package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Comment;
import com.smartcampus.backend.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;

    public List<Comment> getCommentsByTicketId(String ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public Comment addComment(Comment comment) {
        return commentRepository.save(comment);
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
