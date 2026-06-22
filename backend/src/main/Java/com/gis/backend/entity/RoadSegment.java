package com.gis.backend.entity;

import jakarta.persistence.*;

/**
 * 路段实体类
 * 对应数据库 road_segments 表，存储路网中每一条路段的属性
 */
@Entity
@Table(name = "road_segments", indexes = {
    @Index(name = "idx_network_type", columnList = "network_type"),
    @Index(name = "idx_highway", columnList = "highway"),
    @Index(name = "idx_osmid", columnList = "osmid")
})
public class RoadSegment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** OSM 路段唯一标识 */
    @Column(name = "osmid")
    private String osmid;

    /** 道路名称 */
    @Column(name = "name")
    private String name;

    /** OSM 道路等级标签 (motorway, primary, residential 等) */
    @Column(name = "highway")
    private String highway;

    /** 路段长度 (米) */
    @Column(name = "length")
    private Double length;

    /** 接近中心性 (0~1) */
    @Column(name = "closeness")
    private Double closeness;

    /** 介数中心性 (0~1) */
    @Column(name = "betweenness")
    private Double betweenness;

    /** 路网类型: walk / drive */
    @Column(name = "network_type", nullable = false)
    private String networkType;

    /** GeoJSON LineString 几何 (以文本存储，兼容非 PostGIS 环境) */
    @Column(name = "geometry", columnDefinition = "TEXT")
    private String geometry;

    // ===== 构造函数 =====
    public RoadSegment() {}

    public RoadSegment(String osmid, String name, String highway, Double length,
                       Double closeness, Double betweenness, String networkType, String geometry) {
        this.osmid = osmid;
        this.name = name;
        this.highway = highway;
        this.length = length;
        this.closeness = closeness;
        this.betweenness = betweenness;
        this.networkType = networkType;
        this.geometry = geometry;
    }

    // ===== Getter & Setter =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOsmid() { return osmid; }
    public void setOsmid(String osmid) { this.osmid = osmid; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getHighway() { return highway; }
    public void setHighway(String highway) { this.highway = highway; }

    public Double getLength() { return length; }
    public void setLength(Double length) { this.length = length; }

    public Double getCloseness() { return closeness; }
    public void setCloseness(Double closeness) { this.closeness = closeness; }

    public Double getBetweenness() { return betweenness; }
    public void setBetweenness(Double betweenness) { this.betweenness = betweenness; }

    public String getNetworkType() { return networkType; }
    public void setNetworkType(String networkType) { this.networkType = networkType; }

    public String getGeometry() { return geometry; }
    public void setGeometry(String geometry) { this.geometry = geometry; }
}
