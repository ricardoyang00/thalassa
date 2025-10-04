import * as THREE from 'three';

class MyGamingChair extends THREE.Object3D {
    constructor(app, leatherTexture, inoxBlackTexture) {
        super();
        this.app = app;
        this.type = 'Group';

        const seatWidth = 0.6
        const seatDepth = 0.5
        const seatHeight = 0.1
        const backrestHeight = 0.8
        const legHeight = 0.5


        const leatherMaterial = new THREE.MeshPhongMaterial({
            color: "#1a1a1a",
            specular: "#2a2a2a",
            emissive: "#000000",
            shininess: 25,
            map: leatherTexture
        });

        const accentLeatherMaterial = new THREE.MeshPhongMaterial({
            color: "#ff6600",
            specular: "#663300",
            emissive: "#331100",
            emissiveIntensity: 0.1,
            shininess: 30,
            map: leatherTexture
        });

        const metalMaterial = new THREE.MeshPhongMaterial({
            color: "#2a2a2a",
            specular: "#666666",
            emissive: "#000000",
            shininess: 90, 
            map: inoxBlackTexture
        });

        const plasticMaterial = new THREE.MeshPhongMaterial({
            color: "#1a1a1a",
            specular: "#333333",
            emissive: "#000000",
            shininess: 30
        });

        // ===== CHAIR BASE =====
        const baseArmLength = 0.4; // Increased from 0.3 to 0.4
        const baseGeometry = new THREE.BoxGeometry(0.08, 0.04, baseArmLength); // Thicker arms
        
        for (let i = 0; i < 5; i++) {
            const baseArm = new THREE.Mesh(baseGeometry, metalMaterial);
            const angle = (i * Math.PI * 2) / 5;
            baseArm.position.set(0, 0.08, 0);
            baseArm.rotation.y = angle;
            // Position arms properly from center
            baseArm.position.x = Math.sin(angle) * baseArmLength/4;
            baseArm.position.z = Math.cos(angle) * baseArmLength/4;
            this.add(baseArm);
        }

        // Central hub
        const hubGeometry = new THREE.CylinderGeometry(0.07, 0.07, 0.05, 16); // Increased size
        const hub = new THREE.Mesh(hubGeometry, metalMaterial);
        hub.position.set(0, 0.095, 0);
        this.add(hub);

        // Wheels at end of each base arm
        const wheelGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.04, 12); // Bigger wheels
        for (let i = 0; i < 5; i++) {
            const wheel = new THREE.Mesh(wheelGeometry, plasticMaterial);
            const angle = (i * Math.PI * 2) / 5;
            wheel.position.x = Math.sin(angle) * baseArmLength * 0.75; // Further out
            wheel.position.z = Math.cos(angle) * baseArmLength * 0.75;
            wheel.position.y = 0.03;
            wheel.rotation.z = Math.PI / 2;
            this.add(wheel);
        }

        // ===== CENTRAL PILLAR =====
        const pillarGeometry = new THREE.CylinderGeometry(0.035, 0.035, legHeight, 16); // Slightly thicker
        const pillar = new THREE.Mesh(pillarGeometry, metalMaterial);
        pillar.position.set(0, legHeight/2 + 0.1, 0);
        this.add(pillar);

        // Gas cylinder mechanism
        const cylinderGeometry = new THREE.CylinderGeometry(0.045, 0.045, 0.15, 16);
        const cylinder = new THREE.Mesh(cylinderGeometry, plasticMaterial);
        cylinder.position.set(0, legHeight + 0.025, 0);
        this.add(cylinder);

        // ===== SEAT =====
        const seatGeometry = new THREE.BoxGeometry(seatWidth, seatHeight, seatDepth);
        const seat = new THREE.Mesh(seatGeometry, leatherMaterial);
        seat.position.set(0, legHeight + 0.1 + seatHeight/2, 0);
        this.add(seat);

        // Seat accent stripes
        const stripeWidth = 0.04;
        const stripeGeometry = new THREE.BoxGeometry(stripeWidth, seatHeight + 0.005, seatDepth - 0.1);
        for (let i = 0; i < 3; i++) {
            const stripe = new THREE.Mesh(stripeGeometry, accentLeatherMaterial);
            stripe.position.set(-0.15 + i * 0.15, legHeight + 0.1 + seatHeight/2, 0);
            this.add(stripe);
        }

        // ===== BACKREST =====
        const backrestGeometry = new THREE.BoxGeometry(seatWidth, backrestHeight, 0.08);
        const backrest = new THREE.Mesh(backrestGeometry, leatherMaterial);
        backrest.position.set(0, legHeight + 0.1 + seatHeight + backrestHeight/2, -seatDepth/2);
        backrest.rotation.x = -Math.PI / 20; 
        this.add(backrest);

        // Backrest accent panel (center)
        const backAccentGeometry = new THREE.BoxGeometry(0.2, backrestHeight - 0.1, 0.085);
        const backAccent = new THREE.Mesh(backAccentGeometry, accentLeatherMaterial);
        backAccent.position.set(0, legHeight + 0.1 + seatHeight + backrestHeight/2, -seatDepth/2 + 0.005);
        backAccent.rotation.x = -Math.PI / 20;
        this.add(backAccent);

        
        // ===== ARMRESTS =====
        const seatTopY = legHeight + 0.1 + seatHeight;
        const offset = -0.15;
        
        // Armrest support brackets (connect to seat)
        const bracketGeometry = new THREE.BoxGeometry(0.08, 0.06, 0.08);
        
        // Left bracket (connects armrest to seat)
        const leftBracket = new THREE.Mesh(bracketGeometry, metalMaterial);
        leftBracket.position.set(-seatWidth/2, seatTopY + 0.03 + offset, -0.05);
        this.add(leftBracket);

        // Right bracket (connects armrest to seat)
        const rightBracket = new THREE.Mesh(bracketGeometry, metalMaterial);
        rightBracket.position.set(seatWidth/2, seatTopY + 0.03 + offset, -0.05);
        this.add(rightBracket);

        // Armrest posts - connected to brackets
        const armPostGeometry = new THREE.BoxGeometry(0.04, 0.26, 0.04);
        
        // Left armrest post
        const leftArmPost = new THREE.Mesh(armPostGeometry, metalMaterial);
        leftArmPost.position.set(-seatWidth/2 - 0.06, seatTopY + 0.19 + offset, -0.05);
        this.add(leftArmPost);

        // Right armrest post
        const rightArmPost = new THREE.Mesh(armPostGeometry, metalMaterial);
        rightArmPost.position.set(seatWidth/2 + 0.06, seatTopY + 0.19 + offset, -0.05);
        this.add(rightArmPost);

        // Horizontal support bars connecting bracket to post
        const supportBarGeometry = new THREE.BoxGeometry(0.06, 0.02, 0.02);
        
        // Left support bar
        const leftSupportBar = new THREE.Mesh(supportBarGeometry, metalMaterial);
        leftSupportBar.position.set(-seatWidth/2 - 0.03, seatTopY + 0.1 + offset, -0.05);
        this.add(leftSupportBar);

        // Right support bar
        const rightSupportBar = new THREE.Mesh(supportBarGeometry, metalMaterial);
        rightSupportBar.position.set(seatWidth/2 + 0.03, seatTopY + 0.1 + offset, -0.05);
        this.add(rightSupportBar);

        // Armrest pads - properly supported
        const armPadGeometry = new THREE.BoxGeometry(0.15, 0.04, 0.3);
        
        const leftArmPad = new THREE.Mesh(armPadGeometry, accentLeatherMaterial);
        leftArmPad.position.set(-seatWidth/2 - 0.06, seatTopY + 0.34 + offset, -0.05);
        this.add(leftArmPad);

        const rightArmPad = new THREE.Mesh(armPadGeometry, accentLeatherMaterial);
        rightArmPad.position.set(seatWidth/2 + 0.06, seatTopY + 0.34 + offset, -0.05);
        this.add(rightArmPad);


        // ===== HEADREST - BETTER POSITIONED =====
        const headrestGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.08); // Bigger headrest
        const headrest = new THREE.Mesh(headrestGeometry, leatherMaterial);
        headrest.position.set(0, legHeight + 0.1 + seatHeight + backrestHeight + 0.1, -seatDepth/2);
        this.add(headrest);

        // Headrest accent
        const headrestAccentGeometry = new THREE.BoxGeometry(0.25, 0.12, 0.085);
        const headrestAccent = new THREE.Mesh(headrestAccentGeometry, accentLeatherMaterial);
        headrestAccent.position.set(0, legHeight + 0.1 + seatHeight + backrestHeight + 0.1, -seatDepth/2 + 0.005);
        this.add(headrestAccent);

        // Headrest support posts - better positioned
        const headrestSupportGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.18, 8); // Longer supports
        
        const leftHeadrestSupport = new THREE.Mesh(headrestSupportGeometry, metalMaterial);
        leftHeadrestSupport.position.set(-0.1, legHeight + 0.1 + seatHeight + backrestHeight + 0.01, -seatDepth/2 - 0.02);
        this.add(leftHeadrestSupport);

        const rightHeadrestSupport = new THREE.Mesh(headrestSupportGeometry, metalMaterial);
        rightHeadrestSupport.position.set(0.1, legHeight + 0.1 + seatHeight + backrestHeight + 0.01, -seatDepth/2 - 0.02);
        this.add(rightHeadrestSupport);
    }
}

MyGamingChair.prototype.isGroup = true;

export { MyGamingChair };