from flask import Flask, render_template, request, jsonify
import explorerhat as eh
import RPi.GPIO as GPIO
import time

servopos_default = 6.7


# servo setup
GPIO.setmode(GPIO.BCM)

ServoPIN1 = 18
GPIO.setup(ServoPIN1, GPIO.OUT)
servo1 = GPIO.PWM(ServoPIN1, 50)

ServoPIN2 = 15
GPIO.setup(ServoPIN2, GPIO.OUT)
servo2 = GPIO.PWM(ServoPIN2, 50)

servos = [servo1, servo2]


# go to inital centered positions
servos[0].start(servopos_default)
servos[1].start(servopos_default)
time.sleep(0.5)

# stop servo signal to prevent twitching
servos[0].ChangeDutyCycle(0)
servos[1].ChangeDutyCycle(0)



app = Flask(__name__)


@app.route('/') 
def index():
    return render_template('index.html')


@app.route('/servo')
def servo():
    # stop motors
    eh.motor.one.speed(0)
    eh.motor.two.speed(0)
    time.sleep(0.1)

    servonum = request.args.get('num', 0, type=int)
    print("servonum: " + str(servonum))
    
    servopos = request.args.get('pos', 0, type=float)
    print("servopos: " + str(servopos))

    if servopos != 0:
        # set new position
        servos[servonum].ChangeDutyCycle(servopos)
        time.sleep(0.5)
        # stop servo signal to prevent twitching
        servos[servonum].ChangeDutyCycle(0)

    return render_template('index.html')


@app.route('/drive')
def drive():
    motor1 = request.args.get('m1', 0, type=int)
    motor2 = request.args.get('m2', 0, type=int)

    #print str(motor1) + " " + str(motor2)

    #invert motor 1
    motor2 *= -1

    eh.motor.one.speed(motor1)
    eh.motor.two.speed(motor2)

    return jsonify(m1=motor1,m2=motor2)


if __name__ == '__main__':
    app.run(host="0.0.0.0",port=int("88"))

