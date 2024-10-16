def shoppingCart():
    item = input("What item would you like to buy?: ")
    price = float(input("What is the price?: "))
    quantity = int(input("How many would you like?: "))
    total = price * quantity
    print(f"You have bought {quantity} x {item}/s for a total of {total}")

shoppingCart()

# A. donuts
# Given an int count of a number of donuts, return a string
# of the form 'Number of donuts: <count>', where <count> is the number
# passed in. However, if the count is 10 or more, then use the word 'many'
# instead of the actual count.
# So donuts(5) returns 'Number of donuts: 5'
# and donuts(23) returns 'Number of donuts: many'
def donuts(count):
  if count >= 10:
    response = "Number of donuts: many"
  else:
    response = "Number of donuts: " + str(count)
  return response
