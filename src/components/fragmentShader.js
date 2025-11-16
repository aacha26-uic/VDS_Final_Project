// BLOB TUTORIAL CODE USED: https://www.youtube.com/watch?v=6YJ-2MvDqhc&t=2s

const fragmentShader = `
uniform float u_intensity;
uniform float u_time;
uniform float moca_score;

varying vec2 vUv;
varying float vDisplacement;

void main() {
    float distort = 2.0 * vDisplacement * u_intensity * sin(vUv.y * 10.0 + u_time);
    // vec3 color = vec3(abs(vUv - 0.5) * 2.0  * (1.0 - distort), 1.0);

    // New code to make blob solid color
    vec3 light_blue = vec3(0.486, 0.729, 0.862); // #7cbadc
    vec3 blue = vec3(0.271, 0.522, 0.757);            // #4585c1
    vec3 purple = vec3(0.329, 0.349, 0.675);      // #5459AC

    vec3 color;
    if(moca_score <= 0.5){
        float t = moca_score / 0.5;
        color = mix(light_blue, blue, t);
    } else {
        float t = (moca_score - 0.5) / 0.5;
        color = mix(blue, purple, t);
    }

    // Add subtle shading based on geometry
    distort = 0.05 * vDisplacement * u_intensity;
    color = color * (1.0 - distort);

    gl_FragColor = vec4(color, 1.0);
}

`;

export default fragmentShader;