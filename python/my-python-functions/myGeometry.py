#Calculate the area of a given shape
import math
def calculateArea(shape):
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

#Calculate the circumference of a given shape
import math
def calculateCirc(shape):
    if shape == "circle":
        radius = input("Enter the radius (cm): ")
        area = 2 * math.pi * float(radius)
        answer = "Circle circumference is " + str(area) + " cm"
        print(answer)
    else:
        answer = "This shape is not yet supported"
        print(answer)

#Calculate the hypotenuse of a right angled triangle

def calculateHyp(side1, side2):
    hyp = math.sqrt(side1 ** 2 + side2 ** 2)
    answer = "Triangle hypotenuse is " + str(hyp) + " cm"
    print(answer)

calculateHyp(3,4)
