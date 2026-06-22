package com.gis.backend.service;

import com.gis.backend.entity.RoadSegment;
import com.gis.backend.repository.RoadSegmentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RoadSegmentService {

    private final RoadSegmentRepository repository;

    public RoadSegmentService(RoadSegmentRepository repository) {
        this.repository = repository;
    }

    /** 获取路段详情 */
    public Optional<RoadSegment> getById(Long id) {
        return repository.findById(id);
    }

    /** 按 OSM ID 查询 */
    public Optional<RoadSegment> getByOsmid(String osmid) {
        return repository.findByOsmid(osmid);
    }

    /** 分页获取路段（按路网类型） */
    public Page<RoadSegment> getByNetworkType(String networkType, int page, int size) {
        return repository.findByNetworkType(networkType, PageRequest.of(page, size));
    }

    /** 按道路等级筛选 */
    public List<RoadSegment> getByNetworkTypeAndHighway(String networkType, String highway) {
        return repository.findByNetworkTypeAndHighway(networkType, highway);
    }

    /** 获取路网统计信息 */
    public Map<String, Object> getStats(String networkType) {
        Map<String, Object> stats = new LinkedHashMap<>();
        long count = repository.countByNetworkType(networkType);
        List<String> highways = repository.findDistinctHighwaysByNetworkType(networkType);
        stats.put("networkType", networkType);
        stats.put("edgeCount", count);
        stats.put("highwayTypes", highways);
        stats.put("highwayTypeCount", highways.size());
        return stats;
    }

    /** 查询介数中心性 Top N */
    public Page<RoadSegment> getTopBetweenness(String networkType, int topN) {
        return repository.findTopByBetweenness(networkType, PageRequest.of(0, topN));
    }

    /** 按接近中心性范围查询 */
    public List<RoadSegment> getByClosenessRange(String networkType, double min, double max) {
        return repository.findByClosenessRange(networkType, min, max);
    }

    /** 返回 GeoJSON FeatureCollection (供前端直接渲染) */
    public Map<String, Object> toGeoJson(String networkType, int page, int size) {
        Page<RoadSegment> segments = getByNetworkType(networkType, page, size);
        List<Map<String, Object>> features = new ArrayList<>();

        for (RoadSegment seg : segments.getContent()) {
            Map<String, Object> feature = new LinkedHashMap<>();
            feature.put("type", "Feature");

            Map<String, Object> properties = new LinkedHashMap<>();
            properties.put("id", seg.getId());
            properties.put("osmid", seg.getOsmid());
            properties.put("name", seg.getName());
            properties.put("highway", seg.getHighway());
            properties.put("length", seg.getLength());
            properties.put("closeness", seg.getCloseness());
            properties.put("betweenness", seg.getBetweenness());
            feature.put("properties", properties);

            // geometry 字段存的就是 GeoJSON geometry 对象字符串
            feature.put("geometry", parseGeometry(seg.getGeometry()));

            features.add(feature);
        }

        Map<String, Object> featureCollection = new LinkedHashMap<>();
        featureCollection.put("type", "FeatureCollection");
        featureCollection.put("features", features);
        featureCollection.put("totalElements", segments.getTotalElements());
        featureCollection.put("totalPages", segments.getTotalPages());
        featureCollection.put("currentPage", segments.getNumber());
        return featureCollection;
    }

    /** 批量导入路段数据 */
    public List<RoadSegment> importSegments(List<RoadSegment> segments) {
        return repository.saveAll(segments);
    }

    /** 清空指定路网类型数据 */
    public void deleteByNetworkType(String networkType) {
        List<RoadSegment> all = repository.findAll();
        all.stream()
            .filter(s -> networkType.equals(s.getNetworkType()))
            .forEach(repository::delete);
    }

    /** 解析 geometry 字符串为对象 (简单处理) */
    private Object parseGeometry(String geometryStr) {
        if (geometryStr == null || geometryStr.isBlank()) return null;
        try {
            // 尝试用 Jackson 解析为 Map
            return new com.fasterxml.jackson.databind.ObjectMapper().readValue(geometryStr, Map.class);
        } catch (Exception e) {
            return geometryStr;
        }
    }
}
