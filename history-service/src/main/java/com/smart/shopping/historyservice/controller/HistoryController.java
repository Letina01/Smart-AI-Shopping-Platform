package com.smart.shopping.historyservice.controller;

import com.smart.shopping.historyservice.entity.OrderHistory;
import com.smart.shopping.historyservice.entity.SearchHistory;
import com.smart.shopping.historyservice.service.HistoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/history")
public class HistoryController {

    private final HistoryService service;

    public HistoryController(HistoryService service) {
        this.service = service;
    }

    @GetMapping("/search")
    public List<SearchHistory> getSearchHistory(@RequestParam String email) {
        return service.getSearchHistory(email);
    }

    @GetMapping("/orders")
    public List<OrderHistory> getOrderHistory(@RequestParam String userId) {
        return service.getOrderHistory(userId);
    }
}
