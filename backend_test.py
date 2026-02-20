import requests
import sys
import json
from datetime import datetime

class CRMTester:
    def __init__(self, base_url="https://leadhub-app-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_info = None
        self.organization_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        # Test data storage for data isolation testing
        self.super_admin_data = {}
        self.test_user_data = {}

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
            self.user_info = response
            self.organization_id = response.get('organization_id')
            print(f"   Super admin role: {response.get('role', 'Not set')}")
            print(f"   Organization ID: {self.organization_id}")
            # Store super admin data
            self.super_admin_data = {
                'token': self.token,
                'user_info': response,
                'organization_id': self.organization_id
            }
            return True
        return False

    def test_regular_user_registration(self):
        """Test regular user registration with new organization"""
        timestamp = datetime.now().strftime('%H%M%S')
        success, response = self.run_test(
            "Regular User Registration",
            "POST",
            "api/auth/register",
            200,
            data={
                "email": f"testuser{timestamp}@testorg.com",
                "password": "TestPassword123",
                "name": f"Test User {timestamp}",
                "organization_name": f"Test Organization {timestamp}"
            }
        )
        if success and 'token' in response:
            print(f"   Created user: {response.get('name')}")
            print(f"   Organization: {response.get('organization_id')}")
            print(f"   Role: {response.get('role', 'Not set')}")
            # Store test user data
            self.test_user_data = {
                'token': response['token'],
                'user_info': response,
                'organization_id': response.get('organization_id'),
                'email': f"testuser{timestamp}@testorg.com",
                'password': "TestPassword123"
            }
            return True
        return False

    def test_regular_user_login(self):
        """Test regular user login"""
        if not self.test_user_data.get('email'):
            print("   No test user created, skipping login test")
            return False
            
        success, response = self.run_test(
            "Regular User Login",
            "POST",
            "api/auth/login",
            200,
            data={
                "email": self.test_user_data['email'],
                "password": self.test_user_data['password']
            }
        )
        if success and 'token' in response:
            print(f"   Login successful for: {response.get('name')}")
            print(f"   Role: {response.get('role', 'Not set')}")
            # Update test user data with fresh token
            self.test_user_data['token'] = response['token']
            self.test_user_data['user_info'] = response
            return True
        return False

    def switch_to_user(self, user_type="super_admin"):
        """Switch context to different user"""
        if user_type == "super_admin":
            data = self.super_admin_data
        elif user_type == "test_user":
            data = self.test_user_data
        else:
            return False
            
        if not data.get('token'):
            return False
            
        self.token = data['token']
        self.user_info = data['user_info']
        self.organization_id = data['organization_id']
        return True

    # ==================== CRM FUNCTIONALITY TESTS ====================
    
    def test_lead_creation(self, user_type="super_admin"):
        """Test lead creation for different user types"""
        self.switch_to_user(user_type)
        timestamp = datetime.now().strftime('%H%M%S')
        
        lead_data = {
            "first_name": f"John{timestamp}",
            "last_name": f"Doe{timestamp}",
            "email": f"john.doe{timestamp}@example.com",
            "phone": "+1234567890",
            "company": f"Test Company {timestamp}",
            "job_title": "CEO",
            "linkedin_url": "https://linkedin.com/in/johndoe",
            "source": "manual",
            "notes": f"Test lead created by {user_type}"
        }
        
        success, response = self.run_test(
            f"Lead Creation ({user_type})",
            "POST",
            "api/leads",
            200,
            data=lead_data
        )
        if success:
            lead_id = response.get('lead_id')
            print(f"   Created lead: {lead_id}")
            print(f"   Organization: {response.get('organization_id')}")
            
            # Store lead data for later tests
            if user_type == "super_admin":
                self.super_admin_data['lead_id'] = lead_id
            else:
                self.test_user_data['lead_id'] = lead_id
            return lead_id
        return None

    def test_lead_listing(self, user_type="super_admin"):
        """Test lead listing - should only see own organization's leads"""
        self.switch_to_user(user_type)
        
        success, response = self.run_test(
            f"Lead Listing ({user_type})",
            "GET",
            "api/leads",
            200
        )
        if success:
            leads = response if isinstance(response, list) else []
            print(f"   Found {len(leads)} leads")
            if leads:
                # Check all leads belong to current organization
                org_ids = set(lead.get('organization_id') for lead in leads)
                print(f"   Organization IDs in results: {org_ids}")
                if len(org_ids) == 1 and list(org_ids)[0] == self.organization_id:
                    print(f"   ✅ Data isolation confirmed - only own org's leads")
                else:
                    print(f"   ❌ Data isolation issue - seeing other org's leads")
            return leads
        return []

    def test_lead_update(self, user_type="super_admin"):
        """Test lead update"""
        self.switch_to_user(user_type)
        
        # Get lead ID for this user
        lead_id = None
        if user_type == "super_admin":
            lead_id = self.super_admin_data.get('lead_id')
        else:
            lead_id = self.test_user_data.get('lead_id')
            
        if not lead_id:
            print(f"   No lead ID available for {user_type}")
            return False
            
        update_data = {
            "status": "contacted",
            "notes": f"Updated by {user_type} at {datetime.now().isoformat()}"
        }
        
        success, response = self.run_test(
            f"Lead Update ({user_type})",
            "PUT",
            f"api/leads/{lead_id}",
            200,
            data=update_data
        )
        if success:
            print(f"   Updated lead status: {response.get('status')}")
            return True
        return False

    def test_deal_creation(self, user_type="super_admin"):
        """Test deal creation"""
        self.switch_to_user(user_type)
        timestamp = datetime.now().strftime('%H%M%S')
        
        deal_data = {
            "name": f"Test Deal {timestamp}",
            "value": 5000.0,
            "currency": "EUR",
            "stage": "lead",
            "probability": 20,
            "notes": f"Test deal created by {user_type}",
            "task_title": f"Initial contact for deal {timestamp}",
            "task_owner_id": self.user_info.get('user_id'),
            "task_description": "Follow up with prospect"
        }
        
        success, response = self.run_test(
            f"Deal Creation ({user_type})",
            "POST",
            "api/deals",
            200,
            data=deal_data
        )
        if success:
            deal_id = response.get('deal_id')
            print(f"   Created deal: {deal_id}")
            print(f"   Created task: {response.get('created_task_id')}")
            
            # Store deal data
            if user_type == "super_admin":
                self.super_admin_data['deal_id'] = deal_id
            else:
                self.test_user_data['deal_id'] = deal_id
            return deal_id
        return None

    def test_deal_listing(self, user_type="super_admin"):
        """Test deal listing - should only see own organization's deals"""
        self.switch_to_user(user_type)
        
        success, response = self.run_test(
            f"Deal Listing ({user_type})",
            "GET",
            "api/deals",
            200
        )
        if success:
            deals = response if isinstance(response, list) else []
            print(f"   Found {len(deals)} deals")
            if deals:
                # Check data isolation
                org_ids = set(deal.get('organization_id') for deal in deals)
                print(f"   Organization IDs in results: {org_ids}")
                if len(org_ids) == 1 and list(org_ids)[0] == self.organization_id:
                    print(f"   ✅ Data isolation confirmed - only own org's deals")
                else:
                    print(f"   ❌ Data isolation issue - seeing other org's deals")
            return deals
        return []

    def test_task_creation(self, user_type="super_admin"):
        """Test task creation"""
        self.switch_to_user(user_type)
        timestamp = datetime.now().strftime('%H%M%S')
        
        task_data = {
            "title": f"Test Task {timestamp}",
            "description": f"Test task created by {user_type}",
            "status": "todo",
            "priority": "medium",
            "assigned_to": self.user_info.get('user_id')
        }
        
        success, response = self.run_test(
            f"Task Creation ({user_type})",
            "POST",
            "api/tasks",
            200,
            data=task_data
        )
        if success:
            task_id = response.get('task_id')
            print(f"   Created task: {task_id}")
            
            # Store task data
            if user_type == "super_admin":
                self.super_admin_data['task_id'] = task_id
            else:
                self.test_user_data['task_id'] = task_id
            return task_id
        return None

    def test_task_listing(self, user_type="super_admin"):
        """Test task listing - should only see own organization's tasks"""
        self.switch_to_user(user_type)
        
        success, response = self.run_test(
            f"Task Listing ({user_type})",
            "GET",
            "api/tasks",
            200
        )
        if success:
            tasks = response if isinstance(response, list) else []
            print(f"   Found {len(tasks)} tasks")
            if tasks:
                # Check data isolation
                org_ids = set(task.get('organization_id') for task in tasks)
                print(f"   Organization IDs in results: {org_ids}")
                if len(org_ids) == 1 and list(org_ids)[0] == self.organization_id:
                    print(f"   ✅ Data isolation confirmed - only own org's tasks")
                else:
                    print(f"   ❌ Data isolation issue - seeing other org's tasks")
            return tasks
        return []

    def test_company_creation(self, user_type="super_admin"):
        """Test company creation"""
        self.switch_to_user(user_type)
        timestamp = datetime.now().strftime('%H%M%S')
        
        company_data = {
            "name": f"Test Company {timestamp}",
            "industry": "Technology",
            "website": f"https://testcompany{timestamp}.com",
            "size": "50-100",
            "description": f"Test company created by {user_type}"
        }
        
        success, response = self.run_test(
            f"Company Creation ({user_type})",
            "POST",
            "api/companies",
            200,
            data=company_data
        )
        if success:
            company_id = response.get('company_id')
            print(f"   Created company: {company_id}")
            
            # Store company data
            if user_type == "super_admin":
                self.super_admin_data['company_id'] = company_id
            else:
                self.test_user_data['company_id'] = company_id
            return company_id
        return None

    def test_organization_settings_access(self, user_type="super_admin"):
        """Test organization settings access"""
        self.switch_to_user(user_type)
        
        success, response = self.run_test(
            f"Organization Settings Access ({user_type})",
            "GET",
            "api/organizations/settings",
            200
        )
        if success:
            print(f"   Organization: {response.get('name')}")
            print(f"   Deal stages: {len(response.get('deal_stages', []))}")
            print(f"   Task stages: {len(response.get('task_stages', []))}")
            return True
        return False

    def test_data_isolation_cross_org_access(self):
        """Test that users cannot access other organization's data"""
        print("\n🔒 Testing Data Isolation - Cross-Organization Access")
        
        # Try to access super admin's lead with test user token
        self.switch_to_user("test_user")
        super_admin_lead_id = self.super_admin_data.get('lead_id')
        
        if super_admin_lead_id:
            success, response = self.run_test(
                "Cross-Org Lead Access (Should Fail)",
                "GET",
                f"api/leads/{super_admin_lead_id}",
                404  # Should return 404 or 403
            )
            if success:
                print(f"   ✅ Data isolation working - cannot access other org's lead")
            else:
                print(f"   ❌ Data isolation breach - accessed other org's lead")
        
        # Try to access test user's lead with super admin token
        self.switch_to_user("super_admin")
        test_user_lead_id = self.test_user_data.get('lead_id')
        
        if test_user_lead_id:
            success, response = self.run_test(
                "Cross-Org Lead Access as Super Admin",
                "GET",
                f"api/leads/{test_user_lead_id}",
                404  # Super admin should also not see other org's data unless explicitly allowed
            )
            if success:
                print(f"   ✅ Data isolation working - super admin cannot access other org's lead")
            else:
                print(f"   ❌ Data isolation issue - super admin accessed other org's lead")
        
        return True
    
    def test_organization_settings_get(self):
        """Test GET /api/organizations/settings - returns org deal_stages, task_stages, affiliate_enabled"""
        success, response = self.run_test(
            "Get Organization Settings",
            "GET",
            "api/organizations/settings",
            200
        )
        if success:
            print(f"   Deal stages: {len(response.get('deal_stages', []))}")
            print(f"   Task stages: {len(response.get('task_stages', []))}")
            print(f"   Affiliate enabled: {response.get('affiliate_enabled', False)}")
            return response
        return None

    def test_organization_settings_update_deal_stages(self):
        """Test PUT /api/organizations/settings - update deal_stages for organization"""
        new_deal_stages = [
            {"id": "lead", "name": "Lead", "order": 1},
            {"id": "qualified", "name": "Qualified", "order": 2},
            {"id": "proposal", "name": "Proposal", "order": 3},
            {"id": "negotiation", "name": "Negotiation", "order": 4},
            {"id": "won", "name": "Won", "order": 5},
            {"id": "lost", "name": "Lost", "order": 6},
            {"id": "custom_stage", "name": "Custom Stage", "order": 7}
        ]
        
        success, response = self.run_test(
            "Update Deal Stages",
            "PUT",
            "api/organizations/settings",
            200,
            data={"deal_stages": new_deal_stages}
        )
        if success:
            updated_stages = response.get('deal_stages', [])
            print(f"   Updated to {len(updated_stages)} deal stages")
            custom_found = any(stage.get('name') == 'Custom Stage' for stage in updated_stages)
            print(f"   Custom stage added: {custom_found}")
        return success

    def test_organization_settings_toggle_affiliate(self):
        """Test PUT /api/organizations/settings - toggle affiliate_enabled"""
        # First enable affiliate
        success, response = self.run_test(
            "Enable Affiliate Program",
            "PUT",
            "api/organizations/settings",
            200,
            data={"affiliate_enabled": True}
        )
        if success:
            print(f"   Affiliate enabled: {response.get('affiliate_enabled', False)}")
        return success

    def test_organization_members_list(self):
        """Test GET /api/organizations/{org_id}/members - returns list of org members including owner"""
        if not self.organization_id:
            print("   No organization ID available")
            return False
            
        success, response = self.run_test(
            "Get Organization Members",
            "GET",
            f"api/organizations/{self.organization_id}/members",
            200
        )
        if success:
            members = response if isinstance(response, list) else []
            print(f"   Found {len(members)} members")
            if members:
                owner_found = any(member.get('role') == 'owner' for member in members)
                print(f"   Owner found: {owner_found}")
                print(f"   Sample member: {members[0].get('name')} ({members[0].get('role')})")
            return members
        return []

    def test_update_member_role(self, members):
        """Test PUT /api/organizations/members/{user_id}/role - change member role"""
        if not members or len(members) < 1:
            print("   No members available to test role change")
            return False
            
        # Find a non-owner member to test role change
        target_member = None
        for member in members:
            if member.get('role') != 'owner':
                target_member = member
                break
                
        if not target_member:
            print("   No non-owner members found to test role change")
            return True  # This is OK, just means only owner exists
            
        user_id = target_member['user_id']
        current_role = target_member.get('role', 'member')
        new_role = 'admin' if current_role == 'member' else 'member'
        
        success, response = self.run_test(
            f"Update Member Role ({current_role} -> {new_role})",
            "PUT",
            f"api/organizations/members/{user_id}/role?role={new_role}",
            200
        )
        if success:
            print(f"   Role updated successfully")
        return success

    def test_affiliate_enroll(self):
        """Test POST /api/affiliate/enroll - self-enroll as affiliate when org has affiliate enabled"""
        success, response = self.run_test(
            "Enroll as Affiliate",
            "POST",
            "api/affiliate/enroll",
            200
        )
        if success:
            affiliate = response.get('affiliate', {})
            print(f"   Affiliate code: {affiliate.get('affiliate_code', 'N/A')}")
            print(f"   Commission rate: {affiliate.get('commission_rate_tier1', 0)}%")
        return success

    def test_affiliate_status(self):
        """Test GET /api/affiliate/me - get affiliate status and referral link"""
        success, response = self.run_test(
            "Get Affiliate Status",
            "GET",
            "api/affiliate/me",
            200
        )
        if success:
            enrolled = response.get('enrolled', False)
            print(f"   Enrolled: {enrolled}")
            if enrolled:
                affiliate = response.get('affiliate', {})
                referral_link = response.get('referral_link', '')
                print(f"   Referral link: {referral_link[:50]}...")
                print(f"   Total referrals: {affiliate.get('total_referrals', 0)}")
                print(f"   Total earnings: €{affiliate.get('total_earnings', 0)}")
        return success

    def test_affiliate_unenroll(self):
        """Test POST /api/affiliate/unenroll - leave affiliate program"""
        success, response = self.run_test(
            "Unenroll from Affiliate",
            "POST",
            "api/affiliate/unenroll",
            200
        )
        if success:
            print(f"   Successfully unenrolled")
        return success

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
    print("🚀 Testing New CRM Features (4 Features)")
    print("=" * 50)
    
    tester = NewFeaturesTester()
    
    # Test 1: Super Admin Login
    if not tester.test_super_admin_login():
        print("❌ Super admin login failed - stopping tests")
        return 1

    print("\n🔧 Testing Feature 1: Pipeline Management")
    print("-" * 30)
    # Get current org settings
    org_settings = tester.test_organization_settings_get()
    # Update deal stages
    tester.test_organization_settings_update_deal_stages()
    
    print("\n🔧 Testing Feature 2: User List & Role Management")
    print("-" * 30)
    # Get organization members
    members = tester.test_organization_members_list()
    # Test role change
    tester.test_update_member_role(members)
    
    print("\n🔧 Testing Feature 3: Affiliate Toggle")
    print("-" * 30)
    # Enable affiliate program
    tester.test_organization_settings_toggle_affiliate()
    
    print("\n🔧 Testing Feature 4: Affiliate Self-Enrollment")
    print("-" * 30)
    # Test affiliate enrollment
    tester.test_affiliate_enroll()
    # Check affiliate status
    tester.test_affiliate_status()
    # Test unenrollment
    tester.test_affiliate_unenroll()

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