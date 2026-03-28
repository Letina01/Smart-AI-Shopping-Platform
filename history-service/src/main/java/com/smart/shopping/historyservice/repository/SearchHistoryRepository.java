package com.smart.shopping.historyservice.repository;

import com.smart.shopping.historyservice.entity.SearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {
    List<SearchHistory> findByUserEmail(String userEmail);
}
