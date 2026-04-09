package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, UUID> {

    @Query(value = "SELECT COUNT(*) > 0 FROM resources WHERE LOWER(name) = LOWER(:name)", nativeQuery = true)
    boolean existsByNameIgnoreCase(@Param("name") String name);

    @Query(value = """
        SELECT * FROM resources
        WHERE (:name IS NULL OR LOWER(name) LIKE LOWER(CONCAT('%', :name, '%')))
        AND (:location IS NULL OR LOWER(location) LIKE LOWER(CONCAT('%', :location, '%')))
        AND (:capacity IS NULL OR capacity = :capacity)
        AND (:type IS NULL OR type = :type)
        ORDER BY name ASC
        """, nativeQuery = true)
    List<Resource> searchResources(
        @Param("name") String name,
        @Param("location") String location,
        @Param("capacity") Integer capacity,
        @Param("type") String type
    );
}