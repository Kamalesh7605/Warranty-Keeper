package com.warrantykeeper.service;

import com.warrantykeeper.dto.CategoryRequest;
import com.warrantykeeper.dto.CategoryResponse;
import com.warrantykeeper.entity.Category;
import com.warrantykeeper.exception.BadRequestException;
import com.warrantykeeper.exception.ConflictException;
import com.warrantykeeper.exception.ResourceNotFoundException;
import com.warrantykeeper.repository.CategoryRepository;
import com.warrantykeeper.repository.ProductRepository;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;

@ApplicationScoped
public class CategoryService {

    @Inject
    CategoryRepository categories;

    @Inject
    ProductRepository products;

    public List<CategoryResponse> list() {
        return categories.listAll(Sort.by("name")).stream().map(this::toResponse).toList();
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String name = request.name().trim();
        if (categories.existsByName(name, null)) {
            throw new ConflictException("A category named '" + name + "' already exists.");
        }
        Category category = new Category();
        apply(category, request);
        categories.persist(category);
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = find(id);
        if (categories.existsByName(request.name().trim(), id)) {
            throw new ConflictException("A category named '" + request.name().trim() + "' already exists.");
        }
        apply(category, request);
        return toResponse(category);
    }

    /**
     * Deletes a category. If products still use it, {@code reassignToId} must name another category
     * that will receive them; otherwise a 409 is raised.
     */
    @Transactional
    public void delete(Long id, Long reassignToId) {
        Category category = find(id);
        long inUse = products.countByCategory(id);
        if (inUse > 0) {
            if (reassignToId == null) {
                throw new ConflictException(inUse + " product(s) use this category. Reassign them before deleting.");
            }
            if (reassignToId.equals(id)) {
                throw new BadRequestException("Choose a different category to reassign products to.");
            }
            Category target = find(reassignToId);
            products.update("category = ?1 where category.id = ?2", target, id);
        }
        categories.delete(category);
    }

    Category find(Long id) {
        Category category = categories.findById(id);
        if (category == null) {
            throw new ResourceNotFoundException("Category not found.");
        }
        return category;
    }

    private void apply(Category category, CategoryRequest request) {
        category.name = request.name().trim();
        category.description = blankToNull(request.description());
    }

    private CategoryResponse toResponse(Category c) {
        return new CategoryResponse(c.id, c.name, c.description, products.countByCategory(c.id));
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
