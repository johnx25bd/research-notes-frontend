---
type: artifact
title: IPLD-Encoded GeoTIFFs
slug: ipld-geotiffs
artifact_kind: spec
date: 2021
tracks: [spatial-registries]
tier: note
order: 2
tags: [astral, ipld, raster]
status: historical
role: Co-author (Astral)
clause: content-addressed raster tiles -- effectively a registry scheme for raster data
summary: This early Astral scheme replaced GeoTIFF file directories with IPLD data structures, giving tiles and overviews individual content identifiers for verifiable, efficiently queryable raster data.
purpose: Some workflows incorporate raster imagery, so we wanted a verifiable raster data management scheme with spatially aware fetching for efficiency.
approach: An IPLD encoding for GeoTIFFs that replaces the file directory with content-addressed tiles and overviews, each carrying its own content identifier.
status_note: Archived experiment, 2021.
links:
  - { label: "Astral archive", url: "https://astral-protocol.gitbook.io/astral/archive/astral/ipld-and-geotiffs" }
published: true
published_at: 2026-07-14
---
