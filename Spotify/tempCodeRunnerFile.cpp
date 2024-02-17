#include<iostream>
#include<vector>
using namespace std;


int getBit(int n , int i)
{
    int k = 1<<(i-1);
    int ans = n & k;
    return ans != 0;
}
int setBit(int n ,int i)
{
    int k = 1<<(i-1);
    int ans = n | k;
    return ans;
}
int unSet(int n , int i)
{
    int k = ~(1<<(i-1));
    int ans =  n & k;
    return ans;
}

void bitManipulation(int num, int i){
    // Write your code here.
    int ans1 = getBit( num , i);
    vector<int> ans(3);
    ans[0] = ans1;
    ans[1] = setBit(num, i);
    ans[2] = unSet(num, i);
    for(int i=0 ; i<3 ;i++)
    {
        cout<< ans[i] << " ";
    }
    int t = 1<<(i-1);
    cout << t;
    // return ans;
}
int main()
{
    bitManipulation(11,2);
    return 0;
}