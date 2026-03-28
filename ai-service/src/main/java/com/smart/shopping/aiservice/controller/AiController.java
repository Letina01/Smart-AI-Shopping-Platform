package com.smart.shopping.aiservice.controller;

import com.smart.shopping.aiservice.dto.AiRecommendationResponse;
import com.smart.shopping.aiservice.dto.ProductAiDto;
import com.smart.shopping.aiservice.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ai")
public class AiController {

    @Autowired
    private AiService service;

    @PostMapping("/recommend")
    public AiRecommendationResponse recommend(@RequestBody List<ProductAiDto> products,
                                              @RequestParam(required = false) String criteria) {
        return service.analyzeProducts(products, criteria);
    }
}
