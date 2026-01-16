let dataPoints = [];
let maxPoints = 1800;
let startTime;
let cycleDuration = 30000; // 30 seconds in milliseconds
let growthSound;
let deathSound;
let previousValue = null;
let soundPlaying = false;
let deathSoundPlayed = false;

function preload() {
  growthSound = loadSound('growth.mp3');
  deathSound = loadSound('death.mp3', () => {
    deathSound.setLoop(false); // Ensure it doesn't loop
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  startTime = millis();
  textFont('Courier New');
  
  // Initialize with empty points
  for (let i = 0; i < maxPoints; i++) {
    dataPoints.push(null);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(30);
  
  // Title
  fill(255);
  noStroke();
  textSize(30);
  textAlign(CENTER, TOP);
  text("PHOTONIC FATALITY", width / 2, 20);
  
  // Subtitle with light detected percentage
  textSize(20);
  let currentDisplayValue = dataPoints[dataPoints.length - 1];
  if (currentDisplayValue !== null) {
    text("Light detected: " + nf(currentDisplayValue, 1, 2) + "%", width / 2, 55);
  }
  
  // Update data points - add new point on the right
  let elapsed = millis() - startTime;
  let cyclePosition = (elapsed % cycleDuration) / cycleDuration; // 0 to 1
  
  // Create smooth continuous cosine wave
  let t = cyclePosition * TWO_PI;
  let baseValue = cos(t);
  
  // Normalize to 0-1 range
  baseValue = (baseValue + 1) / 2;
  
  // Add soft constant noise for smooth valleys and peaks
  let noise = random(-0.02, 0.02);
  let value = constrain(baseValue + noise, 0, 1);
  
  // Shift array left and add new value on right
  dataPoints.shift();
  dataPoints.push(value);
  
  // Trigger sound when going from 1 to 0
  if (previousValue !== null) {
    // Play death sound when reaching peak (value = 1)
    if (value >= 0.95 && previousValue < 0.95 && !deathSoundPlayed) {
      if (deathSound.isPlaying()) {
        deathSound.stop(); // Stop if already playing
      }
      deathSound.setLoop(false); // Explicitly disable looping
      deathSound.play();
      deathSoundPlayed = true;
    }
    // Detect when we start descending from peak (around 1)
    if (previousValue > 0.95 && value <= 0.95 && !soundPlaying) {
      growthSound.stop(); // Stop if already playing
      growthSound.play();
      soundPlaying = true;
    }
    // Reset flags when value drops below 0.5 (midpoint)
    if (value < 0.5) {
      soundPlaying = false;
      deathSoundPlayed = false; // Reset for next cycle
    }
  }
  previousValue = value;
  
  // Draw the plot area
  let plotMargin = 60;
  let plotTop = 80;
  let plotBottom = height - plotMargin;
  let plotHeight = plotBottom - plotTop;
  let plotWidth = width - 2 * plotMargin;
  
  // Draw the line plot
  stroke(255, 50, 50); // Red
  strokeWeight(2);
  noFill();
  
  beginShape();
  for (let i = 0; i < dataPoints.length; i++) {
    if (dataPoints[i] !== null) {
      let x = map(i, 0, maxPoints - 1, plotMargin, width - plotMargin);
      let y = map(dataPoints[i], 0, 1, plotBottom, plotTop);
      vertex(x, y);
    }
  }
  endShape();
  
  // Draw Sisifo's Life bar (vertical filling bar)
  let barWidth = 40;
  let barX = width - plotMargin - barWidth - 20;
  let barHeight = plotBottom - plotTop;
  let barY = plotTop;
  
  // Get current value (inverse: empty at 1, full at 0)
  let currentValue = dataPoints[dataPoints.length - 1];
  if (currentValue !== null) {
    let fillLevel = 1 - currentValue; // Inverse the value
    
    // Draw bar outline
    stroke(255);
    strokeWeight(2);
    noFill();
    rect(barX, barY, barWidth, barHeight);
    
    // Draw filled portion with alpha
    noStroke();
    fill(255, 20, 147, 128); // Bright pink with alpha 0.5
    let fillHeight = fillLevel * barHeight;
    rect(barX, barY + barHeight - fillHeight, barWidth, fillHeight);
    
    // Label
    fill(255);
    noStroke();
    textSize(20);
    textAlign(CENTER, TOP);
    text("Plant Life", barX + barWidth / 2, barY - 25);
  }
}

