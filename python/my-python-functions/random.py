# This function simulates a basic shopping cart by prompting the user to input details for an item. 
# The user is asked to specify the item name, price, and quantity. 
# It then calculates the total cost by multiplying the price with the quantity. 
# Finally, it displays a summary message showing the quantity, item name, and the calculated total.

def shoppingCart():
    item = input("What item would you like to buy?: ")
    price = float(input("What is the price?: "))
    quantity = int(input("How many would you like?: "))
    total = price * quantity
    print(f"You have bought {quantity} x {item}/s for a total of {total}")

# Given an int count of a number of donuts, return a string of the form 'Number of donuts: <count>', where <count> is the number passed in. 
# However, if the count is 10 or more, then use the word 'many' instead of the actual count. So donuts(5) returns 'Number of donuts: 5' and donuts(23) returns 'Number of donuts: many'

def donuts(count):
  if count >= 10:
    response = "Number of donuts: many"
    print(response)
  else:
    response = "Number of donuts: " + str(count)
    print(response)
  return response 

def madlibs():
  adjective1 = input("Enter an adjective: (description) ")
  noun1 = input("Enter a noun: (person, place, thing) ")
  verb1 = input("Enter a verb: ")
  adjective2 = input("Enter another adjective: (description) ")
  adjective3 = input("Enter one last adjective: (description) ")
  print()
  print(f"Today I went to a {adjective1} zoo.")
  print(f"In an exhibit, I saw a {noun1}")
  print(f"{noun1} was {adjective2} and {verb1}ing")
  print(f"I was {adjective3}!")

madlibs()