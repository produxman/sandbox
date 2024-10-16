#Calculate the area of a given shape
def calculateArea(shape):
    if shape == "rectangle":
        length = input("Enter the rectangle length (cm): ")
        width = input("Enter the rectangle width (cm): ")
        area = float(length) * float(width)
        answer = "Rectangle area is " + str(area)
        print(answer)
    else:
        answer = "This shape is not yet supported"
        print(answer)
    
calculateArea("rectangle")
