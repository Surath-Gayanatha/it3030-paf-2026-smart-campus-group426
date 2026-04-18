package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.Comment;
import com.smartcampus.backend.model.Role;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.service.CommentService;
import com.smartcampus.backend.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CommentController {

    private final CommentService commentService;
    private final UserService userService;

    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable String ticketId) {
        return ResponseEntity.ok(commentService.getCommentsByTicketId(ticketId));
    }

    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<Comment> addComment(@PathVariable String ticketId, @RequestBody Comment commentRequest) {
        User currentUser = userService.getCurrentUser();
        
        Comment comment = Comment.builder()
                .ticketId(ticketId)
                .text(commentRequest.getText())
                .authorEmail(currentUser.getEmail())
                .authorName(currentUser.getName())
                .authorAvatar(currentUser.getProfilePicture())
                .build();
        
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.addComment(comment));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable String id) {
        User currentUser = userService.getCurrentUser();
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        
        commentService.deleteComment(id, currentUser.getEmail(), isAdmin);
        return ResponseEntity.noContent().build();
    }
}
