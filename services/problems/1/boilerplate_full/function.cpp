#include <bits/stdc++.h>
using namespace std;

**Your Code Goes Here**

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n_arr;
    cin >> n_arr;
    vector<int> arr(n_arr);
    for(int i = 0; i < n_arr; i++) cin >> arr[i];

    int target;
    cin >> target;

    vector<int> result = twoSum(arr, target);
    
    for(auto x : result) cout << x << " ";
    cout << endl;
    
    return 0;
}