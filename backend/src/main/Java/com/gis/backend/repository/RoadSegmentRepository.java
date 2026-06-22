package com.gis.backend.repository;

import com.gis.backend.entity.RoadSegment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoadSegmentRepository extends JpaRepository<RoadSegment, Long> {

    /** 按路网类型分页查询 */
    Page<RoadSegment> findByNetworkType(String networkType, Pageable pageable);

    /** 按路网类型 + 道路等级查询 */
    List<RoadSegment> findByNetworkTypeAndHighway(String networkType, String highway);

    /** 按 OSM ID 查询 */
    Optional<RoadSegment> findByOsmid(String osmid);

    /** 统计某种路网类型的路段数 */
    long countByNetworkType(String networkType);

    /** 查询某种路网类型的所有道路等级 */
    @Query("SELECT DISTINCT r.highway FROM RoadSegment r WHERE r.networkType = :networkType ORDER BY r.highway")
    List<String> findDistinctHighwaysByNetworkType(@Param("networkType") String networkType);

    /** 按中心性范围查询 (介数中心性 top N) */
    @Query("SELECT r FROM RoadSegment r WHERE r.networkType = :networkType ORDER BY r.betweenness DESC")
    Page<RoadSegment> findTopByBetweenness(@Param("networkType") String networkType, Pageable pageable);

    /** 按中心性范围查询 */
    @Query("SELECT r FROM RoadSegment r WHERE r.networkType = :networkType " +
           "AND r.closeness BETWEEN :min AND :max")
    List<RoadSegment> findByClosenessRange(@Param("networkType") String networkType,
                                           @Param("min") double min,
                                           @Param("max") double max);
}
