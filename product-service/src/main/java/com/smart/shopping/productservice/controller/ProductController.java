package com.smart.shopping.productservice.controller;

import com.smart.shopping.productservice.dto.ProductDto;
import com.smart.shopping.productservice.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService service;

    @GetMapping("/search")
    public List<ProductDto> search(@RequestParam String q, @RequestParam(required = false) String email) {
        return service.searchProducts(q, email);
    }
}
