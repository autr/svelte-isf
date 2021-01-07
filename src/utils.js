module.exports = `

#define PI 3.14159265358979323846264338327


float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec2 intersection(vec2 a,vec2 b,vec2 c,vec2 d) {
    float ua, ub, denom = (d.y - c.y)*(b.x - a.x) - (d.x - c.x)*(b.y - a.y);
    if (denom == 0.0) return vec2(-1.0,-1.0);
    ua = ((d.x - c.x)*(a.y - c.y) - (d.y - c.y)*(a.x - c.x))/denom;
    ub = ((b.x - a.x)*(a.y - c.y) - (b.y - a.y)*(a.x - c.x))/denom;
    return vec2(
        a.x + ua * (b.x - a.x),
        a.y + ua * (b.y - a.y)
    );
}
vec2 inter(vec2 pointA, vec2 pointB, vec2 pointC, vec2 pointD) {

  float z1 = (pointA.x - pointB.x);
  float z2 = (pointC.x - pointD.x);
  float z3 = (pointA.y - pointB.y);
  float z4 = (pointC.y - pointD.y);
  float dist = z1 * z4 - z3 * z2;
  vec2 blank = vec2(-1.0,-1.0);
  if (dist == 0.0) {
    return blank;
  }
  float tempA = (pointA.x * pointB.y - pointA.y * pointB.x);
  float tempB = (pointC.x * pointD.y - pointC.y * pointD.x);
  float xCoor = (tempA * z2 - z1 * tempB) / dist;
  float yCoor = (tempA * z4 - z3 * tempB) / dist;

  return vec2(xCoor, yCoor);
}

vec2 rotate(vec2 origin, vec2 point, float angle) {
  float rad = (PI / 180.0) * angle;
  float _cos = cos(rad);
  float _sin = sin(rad);
  float run = point.x - origin.x;
  float rise = point.y - origin.y;
  float cx = (_cos * run) + (_sin * rise) + origin.x;
  float cy = (_cos * rise) - (_sin * run) + origin.y;
  return vec2(
    cx,
    cy
  );
}


float noise(vec2 n) {
    const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

float map(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
	float oldRange = oldMax - oldMin;
	float newRange = newMax - newMin;

	return ((oldValue - oldMin) * newRange / oldRange) + newMin;
}

float angle( vec2 a, vec2 b ) {
	return atan(b.y - a.y, b.x - a.x)  * 360.0 / PI;
}

vec2 vec2_from_angle(vec2 xy, float angle, float dist) {
	float x = cos(angle * PI / 180.0) * dist + xy.x;
	float y = sin(angle * PI / 180.0) * dist + xy.y;
    return vec2(x,y);
}

void debug( float v, float min, float max ) {

	vec2		loc = gl_FragCoord.xy;
	float vv = map( v, min, max, 0.0, RENDERSIZE.x );
	if (loc.x > vv && loc.x < vv + 10.0) {
		gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	}

}

vec2 vec2_polar( vec2 a, vec2 b, vec2 c) {

	float slope = (a.y - b.y) / (a.x - b.x);
	float m = -1.0 / slope;
	float x = (m * c.x - c.y - slope * a.x + a.y) / (m - slope);
	float y = m * x - m * c.x + c.y;
	return vec2(x,y);
}

float polar_dist(vec2 a, vec2 b, vec2 c) {

	return ((c.x - a.x)*(b.x - a.x) + (c.y - a.y)*(b.y - a.y)) /
    (pow(b.x - a.x, 2.0) + pow(b.y - a.y, 2.0));
}

float fmod( float a, float b ) {
	return a - b * floor(a/b);
}
`