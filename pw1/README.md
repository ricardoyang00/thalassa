# SGI 2025/2026 - PW1

## Group: T05G05

| Name             | Number    | E-Mail             |
| ---------------- | --------- | ------------------ |
| Bruno Huang      | 202207517 | up202207517@up.pt  |
| Ricardo Yang     | 202208465 | up202208465@up.pt  |

----
## Project information

- (items describing main strong points)
- Scene
  - (Brief description of the created scene)
  - (relative link to the scene)
----
## Issues/Problems

- N/A

## Moodle Tasks 

### PW1-A

**Q:**&nbsp;&nbsp;&nbsp;&nbsp;Did you observe any differences when changing the order of the lines manipulating the transformations?

**A:**&nbsp;&nbsp;&nbsp;&nbsp;No, there was no visible difference. In Three.js, transformations are always applied internally in the same order (scale → rotation → position), so changing the order of the lines in the code does not affect the final result.

![PW1-A screenshot](screenshots/PW1-A.png)

### PW1-B

**Q:**&nbsp;&nbsp;&nbsp;&nbsp;What were the differences between setting the rotation property and calling the rotateX() function? Did it behave as it would in WebGL/WebCGF?

**A:**&nbsp;&nbsp;&nbsp;&nbsp;When setting the rotation property twice, the second assignment simply overwrites the first one and only the last value is applied. 

When using ***rotateX()*** twice, the rotations are accumulated, so the object keeps rotating relative to its current orientation. This behavior is the same as in WebGL/WebCGF, where transformation functions like rotateX() multiply the current transformation matrix, resulting in cumulative effects.

![PW1-B screenshot](screenshots/PW1-B.png)

### PW1-C

**Q1:**&nbsp;&nbsp;&nbsp;&nbsp;How does the **shininess affect** the material components (ambient, diffuse, specular)?

**A1:**&nbsp;&nbsp;&nbsp;&nbsp;Shininess controls the specular component, higher shininess makes the specular highlights smaller and brighter, giving the surface a smoother, more reflective look. It does not affect the ambient or diffuse components.

**Q2:**&nbsp;&nbsp;&nbsp;&nbsp;What were the visual differences between changing the **point or the ambient light** to red?

**A2:**&nbsp;&nbsp;&nbsp;&nbsp;With the point light red, the plane looks mostly red but there are still shading differences, it is brighter near the light source and darker farther away or under objects.
With the ambient light red, the whole scene is evenly tinted red, without shading or directionality.

**Q3:**&nbsp;&nbsp;&nbsp;&nbsp;What changed visually in the scene when the **light source was moved**? How is that change connected to the **local illumination model**?

**A3:**&nbsp;&nbsp;&nbsp;&nbsp;Moving the light from above to below changed which parts of the objects were illuminated or in shadow, the lighting direction inverted. This happens because the diffuse and specular terms in the Phong illumination model depend on the angle between the light source and the surface normals.

![PW1-C screenshot 1](screenshots/PW1-C-4.1.png)

![PW1-C screenshot 2](screenshots/PW1-C-4.2.png)

![PW1-C screenshot 3](screenshots/PW1-C-4.3.png)

![PW1-C screenshot 4](screenshots/PW1-C-4.4.png)

### PW1-D

**Q:**&nbsp;&nbsp;&nbsp;&nbsp;Were there any unexpected behaviors with any of the requested changes?

**A:**&nbsp;&nbsp;&nbsp;&nbsp;No, all changes behaved as expected. The spotlight properties (angle, penumbra, position, target) all responded correctly when modified through the GUI interface. The light cone adjusted its shape and intensity distribution as anticipated.

![PW1-D screenshot 1](screenshots/PW1-D-4.5.png)

**Q:**&nbsp;&nbsp;&nbsp;&nbsp;Did the light helper behave as expected?

**A:**&nbsp;&nbsp;&nbsp;&nbsp;No, there was a discrepancy between the helper visualization and the actual lighting. The spotlight helper showed the light cone extending to areas of the plane that remained dark, indicating the helper may not accurately represent the light's effective range or the actual illumination doesn't match the helper's visual representation.

![PW1-D screenshot 2](screenshots/PW1-D-4.6.png)

### PW1-E

**Q:**&nbsp;&nbsp;&nbsp;&nbsp;Were you able to see changes in real time of the wrap mode? What was necessary for those changes to happen?

**A:**&nbsp;&nbsp;&nbsp;&nbsp;Yes, the wrap mode changes were visible in real time through the GUI interface. To make this work, it was necessary to set the texture's `needsUpdate` property to `true` after changing the wrap mode properties (`wrapS` and `wrapT`). This tells Three.js to reload the texture with the new wrapping settings and update the rendering immediately.

![PW1-E screenshot 1](screenshots/PW1-E-5.1.png)

![PW1-E screenshot 2](screenshots/PW1-E-5.2.png)
