# MYTHOS — 3D asset credits and licensing

The following user-provided models were incorporated into MYTHOS version 005.
Each input GLB contains glTF `asset.extras` with creator, license, title, and source URL.
The 3D derivatives in `public/models/` retain that embedded metadata.
The models are third-party works: **CC BY 4.0**, not original MYTHOS artwork.
Attribution is also available on each exhibit's **Details** tab.

## Greece — Newton Hall (Walston) Athena

- **Author of digital model:** Fitzwilliam Museum, University of Cambridge
- **Title:** Newton Hall (Walston) Athena
- **Source / model:** https://sketchfab.com/3d-models/newton-hall-walston-athena-95a8422dc20348539503dc7b68d72aa7
- **Physical artifact:** https://data.fitzmuseum.cam.ac.uk/id/object/126177
- **Object:** Roman marble sculpture, c. 100–200 CE, depicting the Greek goddess Athena; accession GR.1.2006
- **License of 3D file:** Creative Commons Attribution 4.0 International (CC BY 4.0)
- **MYTHOS changes:** mesh simplified (~746,662 to ~283,727 triangles); embedded photographic texture reduced to 2048 pixels; display rotation and normalization applied at runtime.

## Rome — Zeus (used as a visual analogue of Jupiter)

- **3D author:** LZ Creation
- **Title:** Zeus
- **Source / model:** https://sketchfab.com/3d-models/zeus-782f99eadca041b8b52d9e0a2c6f4e3f
- **License of 3D file:** Creative Commons Attribution 4.0 International (CC BY 4.0)
- **MYTHOS changes:** mesh simplified (~308,436 to ~161,234 triangles); textures reduced from 8192 to 2048 pixels; rendering materials converted to lit PBR in optimization; display rotation and normalization applied at runtime.
- **Historical caveat:** This 3D artwork depicts Greek Zeus, used here as a comparative visual representation of Roman Jupiter. It is **not** an ancient Roman Jupiter artifact, and the deities' identities and religious practices are not simply interchangeable.

## Egypt — Anubis Bust

- **3D author:** lucasthx88
- **Title:** Anubis Bust
- **Source / model:** https://sketchfab.com/3d-models/anubis-bust-636c098547e24805a796cca1773aa9bb
- **License of 3D file:** Creative Commons Attribution 4.0 International (CC BY 4.0)
- **MYTHOS changes:** photographic and material textures reduced to a maximum of 1024 pixels; display normalization applied at runtime. Original geometry retained.
- **Historical caveat:** Modern digital artistic representation, **not** an excavated Egyptian artifact.

## License text and attribution obligation

Creative Commons Attribution 4.0 International: https://creativecommons.org/licenses/by/4.0/

CC BY 4.0 generally permits copying, adapting and redistribution (including commercial use), with attribution, a link to the license, and indication of changes. Preserve the attribution above and source information when publishing or redistributing MYTHOS. **Do not claim authorship of these third-party 3D models.**

The Fitzwilliam Museum's separate **photographic-image** web pages may have different conditions; this project uses the Sketchfab 3D model supplied as CC BY 4.0, not a separately downloaded website photograph.

## MYTHOS_006 web-performance derivatives

Two additional lighter variants have been generated from the already credited CC BY 4.0 source assets: `athena-walston-lite.glb` and `zeus-lite.glb`. They use VTK mesh simplification and resized textures. The original author, source links and CC BY attribution above remain applicable. MYTHOS is not the creator of these source sculptures.

## MYTHOS_010 quality tiers

- Athena: `athena-balanced.glb` combines the existing 283,727-triangle derivative with a 2048px texture resampled from the user-supplied 4096px master (JPEG quality 94). `athena-high.glb` retains that detailed derivative mesh and copies the original 4096px JPEG bytes without recompressing them. ECO retains the 107,811-triangle / 1024px derivative. Mesh UVs, material semantics, source attribution and license metadata are preserved. The previously applied extra quarter-turn was removed after checking the model's forward axis in WebGL.
- Anubis: `anubis-detail.glb` is a byte-for-byte copy of the supplied original (8,630 triangles, original base-color, normal and packed material maps at 1024/2048px). BALANCED and HIGH share it. ECO retains the 1024px web derivative.
- Zeus: BALANCED/HIGH use the supplied 161,234-triangle / 2048px web derivative; ECO uses the 68,741-triangle / 1024px variant. The separately attached Zeus original exceeded the environment's 32 MiB transfer limit, so no detail beyond the archive's source pixels is claimed.

All original author/source/license attribution above remains applicable. Runtime reflection lighting, texture filtering and display transforms were adjusted. No ownership or historical-authenticity claims have changed.
