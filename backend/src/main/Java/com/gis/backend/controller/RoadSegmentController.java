package com.gis.backend.controller;

import com.gis.backend.entity.RoadSegment;
import com.gis.backend.service.RoadSegmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 路网查询 REST API
 *
 * 接口列表:
 *   GET  /api/roads              - 分页获取路段 (GeoJSON FeatureCollection)
 *   GET  /api/roads/{id}         - 获取单条路段详情
 *   GET  /api/roads/osm/{osmid}  - 按 OSM ID 查询
 *   GET  /api/roads/stats        - 路网统计信息
 *   GET  /api/roads/top          - 介数中心性 Top N
 *   GET  /api/roads/filter       - 按中心性范围筛选
 */
@RestController
@RequestMapping("/api/roads")
public class RoadSegmentController {

    private final RoadSegmentService service;

    public RoadSegmentController(RoadSegmentService service) {
        this.service = service;
    }

    /**
     * 获取路网 GeoJSON（供前端 MapLibre 渲染）
     * @param type 路网类型: walk / drive
     * @param page 页码 (从 0 开始)
     * @param size 每页数量 (默认返回全部, size=99999)
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getGeoJson(
            @RequestParam(defaultValue = "walk") String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "99999") int size) {
        return ResponseEntity.ok(service.toGeoJson(type, page, size));
    }

    /**
     * 获取单条路段详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<RoadSegment> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 按 OSM ID 查询
     */
    @GetMapping("/osm/{osmid}")
    public ResponseEntity<RoadSegment> getByOsmid(@PathVariable String osmid) {
        return service.getByOsmid(osmid)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 路网统计信息
     * @param type 路网类型: walk / drive
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestParam(defaultValue = "walk") String type) {
        return ResponseEntity.ok(service.getStats(type));
    }

    /**
     * 介数中心性 Top N 路段
     * @param type 路网类型
     * @param n    Top 数量
     */
    @GetMapping("/top")
    public ResponseEntity<?> getTopBetweenness(
            @RequestParam(defaultValue = "walk") String type,
            @RequestParam(defaultValue = "50") int n) {
        var page = service.getTopBetweenness(type, n);
        return ResponseEntity.ok(Map.of(
                "content", page.getContent(),
                "totalElements", page.getTotalElements()
        ));
    }

    /**
     * 按接近中心性范围筛选
     */
    @GetMapping("/filter")
    public ResponseEntity<List<RoadSegment>> filterByCloseness(
            @RequestParam(defaultValue = "walk") String type,
            @RequestParam double min,
            @RequestParam double max) {
        return ResponseEntity.ok(service.getByClosenessRange(type, min, max));
    }

    /**
     * 按道路等级筛选
     */
    @GetMapping("/highway")
    public ResponseEntity<List<RoadSegment>> getByHighway(
            @RequestParam(defaultValue = "walk") String type,
            @RequestParam String highway) {
        return ResponseEntity.ok(service.getByNetworkTypeAndHighway(type, highway));
    }
}
