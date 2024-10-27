def factorial(num):
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
    hexNumbers = {
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15
}   
    decNum = 0
    exponent = len(hexNum)-1
    for char in hexNum:
        if char not in hexNumbers:
            return 'wtf?'
            break  
        decNum += hexNumbers[char] * (16**exponent)
        exponent -=1
    return decNum

print(hexToDec('ABC'))    


def myCalculator():
    operator = input("Select an arithmetic operator (+, -, *, or /): ")
    var1 = float(input("Enter the first number: "))
    var2 = float(input("Enter the second number: "))
    if(operator == "+"):
        answer = var1 + var2
        print(answer)
    elif(operator == "-"):
        answer = var1 - var2
        print(answer)
    elif(operator == "*"):
        answer = var1 * var2
        print(answer)
    elif(operator == "/"):
        answer = var1 / var2
        print(answer)
    else:
        answer = "wtf?"
        print(answer)

myCalculator()