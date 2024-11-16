from nada_dsl import *

def is_list_present_in_list_of_lists(array: List[List[SecretInteger]], value: List[SecretInteger]) -> SecretBoolean:
    result = Integer(0)
    for sublist in array:
        # Initialize a match indicator as 1 (True)
        sublist_match = Integer(1)
        for i in range(len(value)):
            # Multiply sublist_match by the comparison result to simulate AND
            sublist_match = sublist_match * (sublist[i] == value[i]).if_else(Integer(1), Integer(0))
        
        # If sublist matches, add 1 to the result
        result += sublist_match
    
    # Return True if result > 0, indicating that value is present in array
    return (result > Integer(0))

def nada_main():
    data_owner1 = Party(name="data_owner1")
    data_owner2 = Party(name="data_owner2")
    issues_list1 = []
    issues_list2 = []

    # Create input lists for both data owners
    for i in range(10):
        char_list1 = []
        char_list2 = []
        for j in range(4):
            char_list1.append(
                SecretInteger(Input(name="num1_" + str(i) + "_" + str(j), party=data_owner1))
            )
            char_list2.append(
                SecretInteger(Input(name="num2_" + str(i) + "_" + str(j), party=data_owner2))
            )
        issues_list1.append(char_list1)
        issues_list2.append(char_list2)

    intersection = []
    result = Integer(0)
    # Check for the intersection
    for i in range(10):
        # Check if issues_list2[i] is present in issues_list1
        out = is_list_present_in_list_of_lists(issues_list1, issues_list2[i])
        t = Integer(0)
        for j in range(4):
            # Add elements to the intersection list conditionally
            t += out.if_else(Integer(1), Integer(0))
        result += t/Integer(4)
    # Return the intersection as output
    return [Output(result, f"Score", data_owner1)]
    