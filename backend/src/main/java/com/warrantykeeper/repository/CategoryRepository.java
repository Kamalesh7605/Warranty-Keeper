package com.warrantykeeper.repository;

import com.warrantykeeper.entity.Category;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CategoryRepository implements PanacheRepository<Category> {

    public boolean existsByName(String name, Long excludeId) {
        return count("lower(name) = ?1 and (?2 is null or id <> ?2)", name.toLowerCase(), excludeId) > 0;
    }
}
