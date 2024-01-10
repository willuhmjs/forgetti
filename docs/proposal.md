# Forgetti

## Overview

Fused deposition modeling (FDM) is an additive manufacturing process whereby a three-dimensional (3D) printer deposits filament onto a bed layer by layer until it creates a 3D object (Hamzah, 2019). Unfortunately, various environmental factors can result in a failure occurring during the process. The most common "spaghetti failure" happens when the printed object collapses or detaches from the print bed during the print (Prusa Research, 2021). This project aims to develop software (Forgetti) for these printers to automatically detect and respond to these failures using artificial intelligence (AI).

Forgetti will use HTML, CSS, JavaScript, and Python. Python was chosen for its prevalence in artificial intelligence applications, while the remaining languages were selected for their standardization in full-stack website development. Forgetti will utilize an inference server to accurately identify print failures through a webcam and alert the user promptly. The web dashboard offers real-time detection of print failures, allowing users to halt ongoing prints and interact with their 3D printers. Furthermore, the software will employ the latest object detection models and a visually appealing web dashboard, something lacking in traditional industrial control software. The inference server and website can be hosted on a microcomputer like a Raspberry Pi, dramatically reducing the hardware and operational costs of running Forgetti.

## Intellectual Merit

For the past decade, the popularity of additive manufacturing has grown significantly ("Jabil Unveils Findings of Global Survey on 3D Printing Technology Trends," 2023). While this can be seen as positive, it is also essential to consider the need for digital security measures to address any safety concerns related to the process. Presently, very few supervisory control and data acquisition systems are available for additive manufacturing industrial control systems. Those that do exist are either inefficient, costly, proprietary, or some combination of the three. This seemingly immutable roadblock causes headaches for makers everywhere. Forgetti will revolutionize the field of 3D printing by providing a free, lightweight, and open-source option to hobbyists and business people.

## Broader Impacts

In addition to providing significant intellectual value to manufacturers, Forgetti also enhances security and safety in industrial environments. Concerning physical security, Forgetti mitigates the risks of industrial device failure, minimizing potential employee harm. It also ensures operator safety by preventing accidents. On the cybersecurity front, Forgetti safeguards industrial control systems against unauthorized access and tampering. Consequently, Forgetti protects sensitive data and upholds the integrity of the manufacturing process. The awareness regarding industrial safety that Forgetti brings is imperative to creating a safer workplace environment for everyone.

## References

Hamzah, H. B., Shafiee, S. A., Abdalla, A., & Patel, B. (2019, September 13). 3D printable conductive materials for the fabrication of Electrochemical Sensors: A mini review. The University of Brighton. <https://research.brighton.ac.uk/en/publications/3d-printable-conductive-materials-for-the-fabrication-of-electroc>

Prusa Research. (2021). Spaghetti monster. Prusa Knowledge Base. <https://help.prusa3d.com/article/spaghetti-monster\_1999>

Jabil Unveils Findings of Global Survey on 3D Printing Technology Trends. (2023, August 2). Entertainment Close-up, NA. <https://link.gale.com/apps/doc/A759364295/GPS?u=vbcps&sid=bookmark-GPS&xid=cce8e62a>
