import requests
import sys
import json
from datetime import datetime

class SuperAdminTester:
    def __init__(self, base_url="https://saleslead-hub.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_super_admin_login(self):
        """Test super admin login"""
        success, response = self.run_test(
            "Super Admin Login",
            "POST",
            "api/auth/login",
            200,
            data={"email": "florian@unyted.world", "password": "DavidConstantin18"}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Super admin role: {response.get('role', 'Not set')}")
            return True
        return False

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        success, response = self.run_test(
            "Admin Stats",
            "GET",
            "api/admin/stats",
            200
        )
        if success:
            print(f"   Users: {response.get('total_users', 0)}")
            print(f"   Organizations: {response.get('total_organizations', 0)}")
            print(f"   Revenue: €{response.get('total_revenue', 0)}")
            print(f"   Affiliates: {response.get('total_affiliates', 0)}")
            print(f"   Discount Codes: {response.get('total_discount_codes', 0)}")
        return success

    def test_admin_users(self):
        """Test admin users endpoint"""
        success, response = self.run_test(
            "Admin Users List",
            "GET",
            "api/admin/users",
            200
        )
        if success:
            users = response.get('users', [])
            print(f"   Found {len(users)} users")
            if users:
                print(f"   Sample user: {users[0].get('name')} ({users[0].get('email')})")
        return success

    def test_admin_organizations(self):
        """Test admin organizations endpoint"""
        success, response = self.run_test(
            "Admin Organizations List",
            "GET",
            "api/admin/organizations",
            200
        )
        if success:
            orgs = response if isinstance(response, list) else []
            print(f"   Found {len(orgs)} organizations")
            if orgs:
                print(f"   Sample org: {orgs[0].get('name')} ({orgs[0].get('plan')})")
        return success

    def test_discount_codes_list(self):
        """Test discount codes list"""
        success, response = self.run_test(
            "Discount Codes List",
            "GET",
            "api/admin/discount-codes",
            200
        )
        if success:
            codes = response.get('discount_codes', [])
            print(f"   Found {len(codes)} discount codes")
        return success

    def test_create_discount_code(self):
        """Test creating a discount code"""
        test_code = f"TEST{datetime.now().strftime('%H%M%S')}"
        success, response = self.run_test(
            "Create Discount Code",
            "POST",
            "api/admin/discount-codes",
            200,
            data={
                "code": test_code,
                "discount_percent": 15,
                "discount_type": "percentage",
                "max_uses": 100
            }
        )
        if success:
            print(f"   Created code: {test_code}")
            return test_code
        return None

    def test_validate_discount_code(self, code):
        """Test discount code validation"""
        if not code:
            return False
        success, response = self.run_test(
            "Validate Discount Code",
            "POST",
            f"api/discount-codes/validate?code={code}&plan=monthly",
            200
        )
        if success:
            print(f"   Discount: {response.get('discount_percent', 0)}%")
        return success

    def test_affiliates_list(self):
        """Test affiliates list"""
        success, response = self.run_test(
            "Affiliates List",
            "GET",
            "api/admin/affiliates",
            200
        )
        if success:
            affiliates = response.get('affiliates', [])
            print(f"   Found {len(affiliates)} affiliates")
        return success

    def test_create_affiliate(self):
        """Test creating an affiliate"""
        # First get a user to make affiliate
        users_success, users_response = self.run_test(
            "Get Users for Affiliate",
            "GET",
            "api/admin/users",
            200
        )
        
        if not users_success:
            return False
            
        users = users_response.get('users', [])
        if not users:
            print("   No users available to create affiliate")
            return False
            
        user_id = users[0]['user_id']
        test_code = f"AFF{datetime.now().strftime('%H%M%S')}"
        
        success, response = self.run_test(
            "Create Affiliate",
            "POST",
            "api/admin/affiliates",
            200,
            data={
                "user_id": user_id,
                "affiliate_code": test_code,
                "commission_rate_tier1": 20.0,
                "commission_rate_tier2": 10.0,
                "commission_rate_tier3": 5.0
            }
        )
        if success:
            print(f"   Created affiliate: {test_code}")
        return success

    def test_kit_subscribers(self):
        """Test Kit.com subscribers endpoint"""
        success, response = self.run_test(
            "Kit.com Subscribers",
            "GET",
            "api/kit/subscribers",
            200
        )
        if success:
            subscribers = response.get('subscribers', [])
            print(f"   Found {len(subscribers)} Kit subscribers")
        return success

    def test_kit_account(self):
        """Test Kit.com account endpoint"""
        success, response = self.run_test(
            "Kit.com Account Info",
            "GET",
            "api/kit/account",
            200
        )
        if success:
            print(f"   Kit account: {response.get('name', 'Unknown')}")
            print(f"   Forms: {response.get('forms_count', 0)}")
            print(f"   Tags: {response.get('tags_count', 0)}")
        return success

def main():
    print("🚀 Starting Super Admin System Tests")
    print("=" * 50)
    
    tester = SuperAdminTester()
    
    # Test 1: Super Admin Login
    if not tester.test_super_admin_login():
        print("❌ Super admin login failed - stopping tests")
        return 1

    # Test 2: Admin Dashboard Stats
    tester.test_admin_stats()
    
    # Test 3: Admin Users Management
    tester.test_admin_users()
    
    # Test 4: Admin Organizations
    tester.test_admin_organizations()
    
    # Test 5: Discount Codes
    tester.test_discount_codes_list()
    created_code = tester.test_create_discount_code()
    if created_code:
        tester.test_validate_discount_code(created_code)
    
    # Test 6: Affiliates
    tester.test_affiliates_list()
    tester.test_create_affiliate()
    
    # Test 7: Kit.com Integration
    tester.test_kit_account()
    tester.test_kit_subscribers()

    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Tests completed: {tester.tests_passed}/{tester.tests_run}")
    
    if tester.failed_tests:
        print("\n❌ Failed tests:")
        for failure in tester.failed_tests:
            print(f"   - {failure.get('test', 'Unknown')}: {failure}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"✅ Success rate: {success_rate:.1f}%")
    
    return 0 if success_rate >= 80 else 1

if __name__ == "__main__":
    sys.exit(main())