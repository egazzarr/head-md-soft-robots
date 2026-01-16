#include "AccelStepper.h"

#define dirPin 2
#define stepPin 3
#define motorInterfaceType 1 

AccelStepper stepper(motorInterfaceType, stepPin, dirPin);

void setup() {
  Serial.begin(9600);

  stepper.setMaxSpeed(100);      // slow clockwise speed
  stepper.setAcceleration(50);
}

void loop() {

  // 1️⃣ Still motor: value = 1
  for (int i = 0; i < 20; i++) {      
    Serial.println(1.0);
    delay(50);
  }

  // 2️⃣ Motor moves slowly clockwise, value 1 → 0
  long startPos = stepper.currentPosition();
  long targetPos = 1000;
  stepper.moveTo(targetPos);
  while (stepper.currentPosition() < targetPos) {
    stepper.run();   // non-blocking stepping

    // Map position to value 1 → 0
    float val = 1.0 - float(stepper.currentPosition() - startPos) / (targetPos - startPos);
    Serial.println(val);
    delay(10);       // controls frequency of serial output
  }

  // 3️⃣ Still motor at end of clockwise move: value = 0
  for (int i = 0; i < 20; i++) {
    Serial.println(0.0);
    delay(25);
  }
  delay(3000);



  stepper.setSpeed(-20000);  // negative = anticlockwise
  while (stepper.currentPosition() > 0) {
    stepper.runSpeed();
    Serial.println(0.0);
  }

  // 5️⃣ Still motor, ramp 0 → 1 before next cycle
  for (float v = 0.0; v <= 1.0; v += 0.02) {
    Serial.println(v);
    delay(40);
  }

  // Back to start → 1, repeat loop
}
