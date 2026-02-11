window.addEventListener("DOMContentLoaded", () => {

    /* ================= MUSIC ================= */

    const bgMusic = document.getElementById("bgMusic");

    document.body.addEventListener("click", () => {
        if (bgMusic && bgMusic.paused) {
            bgMusic.volume = 0.6;
            bgMusic.play();
        }
    }, { once: true });


    /* ================= THREE SETUP ================= */

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    document.body.appendChild(renderer.domElement);

    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.zIndex = "1";

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 3;
    controls.maxDistance = 12;

    const group = new THREE.Group();
    scene.add(group);

    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let intersected = null;

    let isUserInteracting = false;

    controls.addEventListener("start", () => isUserInteracting = true);
    controls.addEventListener("end", () => isUserInteracting = false);


    /* ================= CREATE SPHERE ================= */

    function createPhotoSphere(images) {

        group.clear();

        const radius = 3;
        const total = images.length;

        images.forEach((url, i) => {

            const texture = new THREE.TextureLoader().load(url);

            const material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide
            });

            const geometry = new THREE.PlaneGeometry(1.2, 1.2);
            const mesh = new THREE.Mesh(geometry, material);

            const phi = Math.acos(-1 + (2 * i) / total);
            const theta = Math.sqrt(total * Math.PI) * phi;

            mesh.position.setFromSphericalCoords(radius, phi, theta);
            mesh.lookAt(0, 0, 0);

            mesh.userData.image = url;

            group.add(mesh);
        });
    }

    /* Default Images */
    createPhotoSphere([
        "https://picsum.photos/300?1",
        "https://picsum.photos/300?2",
        "https://picsum.photos/300?3",
        "https://picsum.photos/300?4",
        "https://picsum.photos/300?5",
        "https://picsum.photos/300?6"
    ]);


    /* ================= ANIMATION ================= */

    let rotationSpeed = 0.002;

    function animate() {
        requestAnimationFrame(animate);

        if (!isUserInteracting) {
            group.rotation.y += rotationSpeed;
        }

        // Gentle pulse
        const pulse = 1 + Math.sin(Date.now() * 0.001) * 0.02;
        group.scale.set(pulse, pulse, pulse);

        controls.update();
        renderer.render(scene, camera);
    }

    animate();


    /* ================= RESIZE ================= */

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });


    /* ================= UPLOAD ================= */

    const uploadBtn = document.getElementById("uploadBtn");
    const fileInput = document.getElementById("fileInput");

    if (uploadBtn && fileInput) {

        uploadBtn.onclick = () => fileInput.click();

        fileInput.addEventListener("change", (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            const urls = files.map(file => URL.createObjectURL(file));
            createPhotoSphere(urls);
        });
    }


    /* ================= HOVER GLOW ================= */

    window.addEventListener("mousemove", (event) => {

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(group.children);

        if (intersects.length > 0) {

            if (intersected !== intersects[0].object) {

                if (intersected) {
                    intersected.scale.set(1, 1, 1);
                }

                intersected = intersects[0].object;
                intersected.scale.set(1.3, 1.3, 1.3);
            }

        } else {
            if (intersected) {
                intersected.scale.set(1, 1, 1);
            }
            intersected = null;
        }
    });


    /* ================= CLICK FULLSCREEN ================= */

    window.addEventListener("click", () => {

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(group.children);

        if (intersects.length > 0) {
            const modal = document.getElementById("imageModal");
            const modalImg = document.getElementById("modalImg");

            modal.style.display = "flex";
            modalImg.src = intersects[0].object.userData.image;
        }
    });

    const modal = document.getElementById("imageModal");
    if (modal) {
        modal.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }


    /* ================= FLOATING HEARTS ================= */

    setInterval(() => {

        const heart = document.createElement("div");
        heart.className = "heart";
        heart.innerHTML = "💖";
        heart.style.left = Math.random() * 100 + "vw";
        heart.style.zIndex = "5";

        document.body.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 7000);

    }, 600);

});
