const canvas = document.getElementById('Canva');
const ctx = canvas.getContext('2d');
const circles = [];
let startX, startY;
let circleCreationEnabled = false;
let eraseModeEnabled = false;
let moveModeEnabled = false;
let resizeModeEnabled = false;
let selectedCircleIndex = -1;
let offsetX, offsetY;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.pointerEvents = 'none'; // Disable mouse events initially

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  redrawCirclesAndTangents();
});

document.getElementById('enableBtn').addEventListener('click', () => {
  circleCreationEnabled = true;
  eraseModeEnabled = false;
  moveModeEnabled = false;
  resizeModeEnabled = false;
  canvas.style.pointerEvents = 'auto';
});

document.getElementById('eraseBtn').addEventListener('click', () => {
  eraseModeEnabled = true;
  circleCreationEnabled = false;
  moveModeEnabled = false;
  resizeModeEnabled = false;
  canvas.style.pointerEvents = 'auto';
});

document.getElementById('moveBtn').addEventListener('click', () => {
  moveModeEnabled = true;
  circleCreationEnabled = false;
  eraseModeEnabled = false;
  resizeModeEnabled = false;
  canvas.style.pointerEvents = 'auto';
});

document.getElementById('resizeBtn').addEventListener('click', () => {
  resizeModeEnabled = true;
  circleCreationEnabled = false;
  eraseModeEnabled = false;
  moveModeEnabled = false;
  canvas.style.pointerEvents = 'auto';
});

canvas.addEventListener('mousedown', (event) => {
  if (circleCreationEnabled) {
    startX = event.clientX - canvas.offsetLeft;
    startY = event.clientY - canvas.offsetTop;
    drawCircle(startX, startY, 0, 'blue');
  } else if (eraseModeEnabled) {
    const mouseX = event.clientX - canvas.offsetLeft;
    const mouseY = event.clientY - canvas.offsetTop;
    const index = findCircle(mouseX, mouseY);

    if (index !== -1) {
      circles.splice(index, 1); // Remove the circle from the array
      redrawCirclesAndTangents(); // Redraw canvas and tangents without the removed circle
    }
  } else if (moveModeEnabled) {
    const mouseX = event.clientX - canvas.offsetLeft;
    const mouseY = event.clientY - canvas.offsetTop;
    selectedCircleIndex = findCircle(mouseX, mouseY);

    if (selectedCircleIndex !== -1) {
      offsetX = mouseX - circles[selectedCircleIndex].x;
      offsetY = mouseY - circles[selectedCircleIndex].y;
    }
  } else if (resizeModeEnabled) {
    const mouseX = event.clientX - canvas.offsetLeft;
    const mouseY = event.clientY - canvas.offsetTop;
    selectedCircleIndex = findCircle(mouseX, mouseY);
  }
  redrawCirclesAndTangents();
});

canvas.addEventListener('mousemove', (event) => {
  if (moveModeEnabled && selectedCircleIndex !== -1) {
    const mouseX = event.clientX - canvas.offsetLeft;
    const mouseY = event.clientY - canvas.offsetTop;
    circles[selectedCircleIndex].x = mouseX - offsetX;
    circles[selectedCircleIndex].y = mouseY - offsetY;
    redrawCirclesAndTangents();
  } else if (resizeModeEnabled && selectedCircleIndex !== -1) {
    const mouseX = event.clientX - canvas.offsetLeft;
    const mouseY = event.clientY - canvas.offsetTop;
    const dx = mouseX - circles[selectedCircleIndex].x;
    const dy = mouseY - circles[selectedCircleIndex].y;
    circles[selectedCircleIndex].radius = Math.sqrt(dx * dx + dy * dy);
    redrawCirclesAndTangents();
  } else if (circleCreationEnabled && startX !== undefined && startY !== undefined) {
    const mouseX = event.clientX - canvas.offsetLeft;
    const mouseY = event.clientY - canvas.offsetTop;

    const radius = Math.sqrt(Math.pow(mouseX - startX, 2) + Math.pow(mouseY - startY, 2));
    redrawCirclesAndTangents();
    drawCircle(startX, startY, radius, 'blue');
  } else {
    redrawCirclesAndTangents();
  }
});

canvas.addEventListener('mouseup', (event) => {
  if (circleCreationEnabled && startX !== undefined && startY !== undefined) {
    const endX = event.clientX - canvas.offsetLeft;
    const endY = event.clientY - canvas.offsetTop;

    const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const circle = { x: startX, y: startY, radius, color: 'blue' };
    circles.push(circle);
    startX = undefined;
    startY = undefined;
  } else if (moveModeEnabled || resizeModeEnabled) {
    selectedCircleIndex = -1; // Reset selected circle index
  }
  redrawCirclesAndTangents();
});

document.addEventListener('keydown', (event) => {
  if ((event.keyCode === 8 || event.key === 'Backspace') && circles.length > 0) {
    circles.pop(); // Remove the last circle from the array
    redrawCirclesAndTangents();
  }
});

function drawCircle(x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();
  // Draw cross at the center of the circle
  ctx.beginPath();
  ctx.moveTo(x - 5, y); // Left
  ctx.lineTo(x + 5, y); // Right
  ctx.moveTo(x, y - 5); // Top
  ctx.lineTo(x, y + 5); // Bottom
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
}

function findCircle(x, y) {
  for (let i = circles.length - 1; i >= 0; i--) {
    const circle = circles[i];
    const dx = x - circle.x;
    const dy = y - circle.y;
    const distanceSquared = dx * dx + dy * dy;
    if (distanceSquared <= circle.radius * circle.radius) {
      return i; // Return the index of the circle if the click is inside it
    }
  }
  return -1; // Return -1 if no circle is found
}

// Function to calculate the common tangents between two circles
function calculateCommonTangents(circle1, circle2) {
  const dx = circle2.x - circle1.x;
  const dy = circle2.y - circle1.y;
  const r1 = circle1.radius;
  const r2 = circle2.radius;

  // Calculate the distance between the centers of the circles
  const d = Math.sqrt(dx * dx + dy * dy);

  // Calculate the angle between the centers of the circles
  const angle = Math.atan2(dy, dx);

  // Calculate the angle between the centers of the circles
  const alpha = Math.acos((r1 - r2) / d);

  // Calculate the points of tangency on circle1
  const point1 = {
    x: circle1.x + r1 * Math.cos(angle + alpha),
    y: circle1.y + r1 * Math.sin(angle + alpha),
  };

  const point2 = {
    x: circle1.x + r1 * Math.cos(angle - alpha),
    y: circle1.y + r1 * Math.sin(angle - alpha),
  };

  // Calculate the points of tangency on circle2
  const point3 = {
    x: circle2.x + r2 * Math.cos(angle + alpha),
    y: circle2.y + r2 * Math.sin(angle + alpha),
  };

  const point4 = {
    x: circle2.x + r2 * Math.cos(angle - alpha),
    y: circle2.y + r2 * Math.sin(angle - alpha),
  };

  // Return the tangents as line segments
  return [
    { x1: point1.x, y1: point1.y, x2: point3.x, y2: point3.y },
    { x1: point2.x, y1: point2.y, x2: point4.x, y2: point4.y },
  ];
}

// Function to draw a line segment
function drawLine(x1, y1, x2, y2, color) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();
}

// Function to redraw circles and common tangents
function redrawCirclesAndTangents() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  circles.forEach((circle, index) => {
    drawCircle(circle.x, circle.y, circle.radius, circle.color);

    // Draw common tangents between consecutive circles
    if (index < circles.length - 1) {
      const commonTangents = calculateCommonTangents(circle, circles[index + 1]);
      drawLine(commonTangents[0].x1, commonTangents[0].y1, commonTangents[0].x2, commonTangents[0].y2, 'red');
      drawLine(commonTangents[1].x1, commonTangents[1].y1, commonTangents[1].x2, commonTangents[1].y2, 'red');
    }
  });
}
