#Define the function  
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
    
#Run the function  
print(factorial(5)) 