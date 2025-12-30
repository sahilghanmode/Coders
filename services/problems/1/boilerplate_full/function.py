from typing import List

**Your Code Goes Here**

if __name__ == "__main__":
    n_arr = int(input())
arr = list(map(int, input().split()))
target = int(input())
    
    result = twoSum(arr, target)
    
    print(' '.join(map(str, result)))