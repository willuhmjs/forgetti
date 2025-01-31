## Overview

This documentation establishes principles for gathering high-quality training data for 3D printing models. Adhering to these guidelines ensures accurate, reliable data that improves model performance and minimizes risks and inefficiencies during the data collection process. 

**Data should represent diverse real-world scenarios while minimizing unnecessary costs, risks, and resource usage.**

The goal is to collect training data that captures partially printed objects with:

* Obvious areas of successful printing  
* Obvious areas of failure  
* Obscure or subtle failure areas

During data collection, every effort should be made to reduce:

1. Damage to the Manufacturing Environment  
   * Equipment (e.g., 3D printers, print beds, extruder nozzles, tools).  
   * Surrounding items (e.g., tables, shelving, chairs, storage areas).  
   * The physical workspace (e.g., walls, flooring, windows, ventilation systems).  
2. Safety Risks to Personnel  
   * Protect researchers and nearby staff from hazards such as moving parts, heat, fumes, or sharp debris.  
3. Material and Resource Waste  
   * Minimize unnecessary use of 3D printing filament and other consumables.  
   * Avoid excessive wear on machinery.  
4. Time Loss  
   * Optimize processes to avoid unnecessary delays during printing or data recording.

The best way to create an effective 3D model is to sculpt a model designed to fail and then inject malicious G-Code into the G-Code.

Below is a list of strategies for producing failures. Popular digital models are modified using these strategies to antagonize print failures. 

## Gap & Shift
This method is performed by slicing the model at different points. This can vary, but the following models are cut in horizontal slices between \(0\% \leq x \leq 50\%\) horizontally, and anywhere vertically.