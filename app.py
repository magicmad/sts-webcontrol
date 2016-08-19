from flask import Flask, render_template, request, jsonify
import explorerhat as eh

app = Flask(__name__)


@app.route('/') 
def index():
    return render_template('index.html')


@app.route('/drive')
def drive():
    motor1 = request.args.get('m1', 0, type=int)
    motor2 = request.args.get('m2', 0, type=int)

    #print str(motor1) + " " + str(motor2)
	
	# invert motor 1
    motor1 *= -1
	
    eh.motor.one.speed(motor1)
    eh.motor.two.speed(motor2)
	
    return jsonify(m1=motor1,m2=motor2)


if __name__ == '__main__':
    app.run(host="0.0.0.0",port=int("88"))

