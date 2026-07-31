// js/models/Parts.js
class M {
    static parts = {
        shadow: (size = 0.35) => {
            const geo = new THREE.CircleGeometry(size, 16);
            const mat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.y = 0.001;
            return mesh;
        },
        box: (w, h, d, material, x = 0, y = 0, z = 0) => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        },
        pivotBox: (w, h, d, material, px = 0, py = 0, pz = 0) => {
            const geo = new THREE.BoxGeometry(w, h, d);
            geo.translate(px, py, pz);
            const mesh = new THREE.Mesh(geo, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        },
        sphere: (r, material, x = 0, y = 0, z = 0, opts = {}) => {
            const geo = new THREE.SphereGeometry(r, 16, 12, 0, Math.PI * 2, 0, opts.topOnly ? Math.PI / 2 : Math.PI);
            const mesh = new THREE.Mesh(geo, material);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        },
        cylinder: (rTop, rBot, h, material, x = 0, y = 0, z = 0, segs = 12) => {
            const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs), material);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        },
        cone: (r, h, material, x = 0, y = 0, z = 0) => {
            const mesh = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), material);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            return mesh;
        },
        ring: (r, t, material, x = 0, y = 0, z = 0) => {
            const mesh = new THREE.Mesh(new THREE.TorusGeometry(r, t, 8, 24), material);
            mesh.position.set(x, y, z);
            mesh.rotation.x = Math.PI / 2;
            return mesh;
        }
    };
}