import math

def factorial(num):
    # This function calculates the factorial of a positive integer 'num'.
    # It returns None if 'num' is not a positive integer.
    if type(num) is int and num > 0:
        i = 0
        f = 1
        while i < num:
            i = i + 1
            f = f * i
        return f
    else:
        return None

def hexToDec(hexNum):
    # This function converts a hexadecimal string 'hexNum' into its decimal equivalent.
    # It uses a dictionary to map hexadecimal digits to decimal values.
    # If an invalid character is found, it returns 'wtf?' as an error message.
    hexNumbers = {
        '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
        'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15
    }
    decNum = 0
    exponent = len(hexNum) - 1
    for char in hexNum:
        if char not in hexNumbers:
            return 'wtf?'
        decNum += hexNumbers[char] * (16 ** exponent)
        exponent -= 1
    return decNum

print(hexToDec('ABC')) 

def myCalculator():
    # This function acts as a basic calculator for addition, subtraction, multiplication, and division.
    # It takes user input for the operator and two numbers, then performs the specified operation.
    operator = input("Select an arithmetic operator (+, -, *, or /): ")
    var1 = float(input("Enter the first number: "))
    var2 = float(input("Enter the second number: "))
    if operator == "+":
        answer = var1 + var2
        print(answer)
    elif operator == "-":
        answer = var1 - var2
        print(answer)
    elif operator == "*":
        answer = var1 * var2
        print(answer)
    elif operator == "/":
        answer = var1 / var2
        print(answer)
    else:
        answer = "wtf?"
        print(answer)

def calculateArea(shape):
    # This function calculates the area of a given shape (rectangle or circle).
    # It takes user input for dimensions and prints the area.
    if shape == "rectangle":
        length = input("Enter the rectangle length (cm): ")
        width = input("Enter the rectangle width (cm): ")
        area = float(length) * float(width)
        answer = "Rectangle area is " + str(area)
        print(answer)
    elif shape == "circle":
        radius = input("Enter the radius (cm): ")
        area = math.pi * float(radius) ** 2
        answer = "Circle area is " + str(area) + " cm^2"
        print(answer)
    else:
        answer = "This shape is not yet supported"
        print(answer)


def calculateCirc(shape):
    # This function calculates the circumference of a given shape (currently only circles).
    # It takes user input for the radius and prints the circumference.
    if shape == "circle":
        radius = input("Enter the radius (cm): ")
        area = 2 * math.pi * float(radius)
        answer = "Circle circumference is " + str(area) + " cm"
        print(answer)
    else:
        answer = "This shape is not yet supported"
        print(answer)

def calculateHyp(side1, side2):
    # This function calculates the hypotenuse of a right-angled triangle
    # using the Pythagorean theorem, given side1 and side2.
    hyp = math.sqrt(side1 ** 2 + side2 ** 2)
    answer = "Triangle hypotenuse is " + str(hyp) + " cm"
    print(answer)
