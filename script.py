import requests
import json

# GraphQL server URL
url = "http://zendesk.openapi-builder.ti.trilogy.com/graphql/"

# Headers for the request
headers = {
    "Content-Type": "application/json",
}

def execute_mutation(mutation, variables=None):
    payload = {
        "query": mutation,
        "variables": variables
    }
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 200:
        result = response.json()
        if 'errors' in result:
            print(f"GraphQL Errors: {json.dumps(result['errors'], indent=2)}")
            return None
        return result
    else:
        print(f"HTTP Error: {response.status_code}")
        print(f"Response: {response.text}")
        return None

# # Create Organizations
# org_mutation = """
# mutation CreateOrganization($name: String!, $externalId: String!, $details: String!, $domainNames: String!, $notes: String!, $sharedComments: Boolean!, $sharedTickets: Boolean!, $tags: String!) {
#   CreateOrganization(
#     name: $name
#     external_id: $externalId
#     details: $details
#     domain_names: $domainNames
#     notes: $notes
#     shared_comments: $sharedComments
#     shared_tickets: $sharedTickets
#     tags: $tags
#   ) {
#     id
#     name
#   }
# }
# """

# organizations = [
#     {
#         "name": "Acme Corporation",
#         "externalId": "ACME001",
#         "details": "A leading provider of innovative solutions",
#         "domainNames": "acme.com,acmecorp.com",
#         "notes": "Key account, high priority",
#         "sharedComments": True,
#         "sharedTickets": True,
#         "tags": "enterprise,manufacturing"
#     },
#     {
#         "name": "TechNova Solutions",
#         "externalId": "TECHNOVA001",
#         "details": "Cutting-edge technology consulting firm",
#         "domainNames": "technova.com,technovasolutions.com",
#         "notes": "Growing account, focus on AI and ML",
#         "sharedComments": True,
#         "sharedTickets": True,
#         "tags": "technology,consulting"
#     },
#     {
#         "name": "GreenLeaf Eco Products",
#         "externalId": "GREENLEAF001",
#         "details": "Sustainable and eco-friendly product manufacturer",
#         "domainNames": "greenleaf.com,greenleafeco.com",
#         "notes": "Emphasize sustainability in all interactions",
#         "sharedComments": True,
#         "sharedTickets": True,
#         "tags": "eco-friendly,manufacturing"
#     }
# ]

# org_ids = []
# for org in organizations:
#     result = execute_mutation(org_mutation, org)
#     if result and 'data' in result and 'CreateOrganization' in result['data']:
#         org_ids.append(result['data']['CreateOrganization']['id'])
#         print(f"Created organization: {result['data']['CreateOrganization']['name']}")
#     else:
#         print(f"Failed to create organization: {org['name']}")
#         print(f"Result: {json.dumps(result, indent=2)}")

# # Create Groups
# group_mutation = """
# mutation CreateGroup($name: String!, $description: String!, $isPublic: Boolean!) {
#   CreateGroup(
#     name: $name
#     description: $description
#     is_public: $isPublic
#   ) {
#     id
#     name
#   }
# }
# """

# groups = [
#     {
#         "name": "Customer Support",
#         "description": "Front-line support team handling general inquiries",
#         "isPublic": True
#     },
#     {
#         "name": "Technical Support",
#         "description": "Specialized team handling complex technical issues",
#         "isPublic": True
#     },
#     {
#         "name": "Account Management",
#         "description": "Team responsible for managing key accounts and relationships",
#         "isPublic": False
#     }
# ]

# group_ids = []
# for group in groups:
#     result = execute_mutation(group_mutation, group)
#     if result and 'data' in result and 'CreateGroup' in result['data']:
#         group_ids.append(result['data']['CreateGroup']['id'])
#         print(f"Created group: {result['data']['CreateGroup']['name']}")
#     else:
#         print(f"Failed to create group: {group['name']}")
#         print(f"Result: {json.dumps(result, indent=2)}")

# # Create Users (Agents)
# user_mutation = """
# mutation CreateUser($name: String!, $email: String!, $role: String!, $phone: String!, $timeZone: String!, $tags: String!) {
#   CreateUser(
#     name: $name
#     email: $email
#     role: $role
#     phone: $phone
#     time_zone: $timeZone
#     tags: $tags
#   ) {
#     id
#     name
#     email
#   }
# }
# """

# users = [
#     {
#         "name": "John Doe",
#         "email": "john.doe@example.com",
#         "role": "agent",
#         "phone": "+1234567890",
#         "timeZone": "America/New_York",
#         "tags": "customer-support,technical"
#     },
#     {
#         "name": "Jane Smith",
#         "email": "jane.smith@example.com",
#         "role": "agent",
#         "phone": "+1987654321",
#         "timeZone": "America/Los_Angeles",
#         "tags": "technical-support,senior"
#     },
#     {
#         "name": "Mike Johnson",
#         "email": "mike.johnson@example.com",
#         "role": "agent",
#         "phone": "+1122334455",
#         "timeZone": "Europe/London",
#         "tags": "account-management,enterprise"
#     }
# ]

# user_ids = []
# for user in users:
#     result = execute_mutation(user_mutation, user)
#     if result and 'data' in result and 'CreateUser' in result['data']:
#         user_ids.append(result['data']['CreateUser']['id'])
#         print(f"Created user: {result['data']['CreateUser']['name']}")
#     else:
#         print(f"Failed to create user: {user['name']}")
#         print(f"Result: {json.dumps(result, indent=2)}")

# Create Tickets
ticket_mutation = """
mutation CreateTicket($subject: String!, $description: String!, $priority: String!, $status: String!, $type: String!, $tags: String!) {
  CreateTicket(
    subject: $subject
    description: $description
    priority: $priority
    status: $status
    type: $type
    tags: $tags
  ) {
    id
    subject
  }
}
"""

tickets = [
    {
        "subject": "Unable to access account",
        "description": "I'm having trouble logging into my account. It says my password is incorrect, but I'm sure it's right.",
        "priority": "high",
        "status": "open",
        "type": "incident",
        "tags": "account-access,login"
    },
    {
        "subject": "Feature request: Dark mode",
        "description": "It would be great if you could add a dark mode to the application. It's easier on the eyes when working late.",
        "priority": "low",
        "status": "new",
        "type": "task",
        "tags": "feature-request,ui"
    },
    {
        "subject": "Billing discrepancy on latest invoice",
        "description": "The amount on our latest invoice seems to be higher than expected. Can someone please review and explain the charges?",
        "priority": "normal",
        "status": "open",
        "type": "problem",
        "tags": "billing,invoice"
    },
    {
        "subject": "Product not functioning as expected",
        "description": "The new widget I purchased isn't working correctly. It keeps shutting off unexpectedly.",
        "priority": "high",
        "status": "open",
        "type": "incident",
        "tags": "product-issue,malfunction"
    },
    {
        "subject": "Request for additional user licenses",
        "description": "We need to add 5 more user licenses to our account. Can you please provide a quote?",
        "priority": "normal",
        "status": "new",
        "type": "task",
        "tags": "account-management,licensing"
    },
    {
        "subject": "Integration with third-party software",
        "description": "We're looking to integrate your product with our CRM system. Do you have any documentation or APIs available?",
        "priority": "low",
        "status": "open",
        "type": "question",
        "tags": "integration,api"
    },
    {
        "subject": "Slow performance during peak hours",
        "description": "We've noticed that the system becomes very slow between 2-4 PM daily. Can you investigate?",
        "priority": "high",
        "status": "open",
        "type": "problem",
        "tags": "performance,optimization"
    },
    {
        "subject": "Training request for new team members",
        "description": "We have 3 new team members who need training on your software. What options do you offer?",
        "priority": "normal",
        "status": "new",
        "type": "task",
        "tags": "training,onboarding"
    },
    {
        "subject": "Data export functionality not working",
        "description": "When trying to export our data, the process fails halfway through. We need this resolved urgently.",
        "priority": "high",
        "status": "open",
        "type": "incident",
        "tags": "data-export,bug"
    },
    {
        "subject": "Request for custom report",
        "description": "We need a custom report that shows user activity over the last 6 months. Is this possible?",
        "priority": "low",
        "status": "new",
        "type": "task",
        "tags": "reporting,customization"
    },
    {
        "subject": "Security concern: Unusual login activity",
        "description": "We've noticed some suspicious login attempts from unfamiliar IP addresses. Can you help us investigate?",
        "priority": "high",
        "status": "open",
        "type": "problem",
        "tags": "security,login-activity"
    },
    {
        "subject": "Feature request: Mobile app",
        "description": "It would be incredibly helpful if you could develop a mobile app version of your software.",
        "priority": "low",
        "status": "new",
        "type": "task",
        "tags": "feature-request,mobile"
    },
    {
        "subject": "Assistance with bulk data import",
        "description": "We're trying to import a large dataset into the system, but keep encountering errors. Can you provide guidance?",
        "priority": "normal",
        "status": "open",
        "type": "question",
        "tags": "data-import,bulk-operations"
    }
]

ticket_ids = []
for ticket in tickets:
    result = execute_mutation(ticket_mutation, ticket)
    if result and 'data' in result and 'CreateTicket' in result['data']:
        ticket_ids.append(result['data']['CreateTicket']['id'])
        print(f"Created ticket: {result['data']['CreateTicket']['subject']}")
    else:
        print(f"Failed to create ticket: {ticket['subject']}")
        print(f"Result: {json.dumps(result, indent=2)}")

# Create Ticket Comments
# comment_mutation = """
# mutation CreateTicketComment($ticketId: String!, $authorId: String!, $body: String!, $public: Boolean!) {
#   CreateTicketComment(
#     ticket_id: $ticketId
#     author_id: $authorId
#     body: $body
#     public: $public
#   ) {
#     id
#     body
#   }
# }
# """

# comments = [
#     {
#         "body": "I've reset your password. Please try logging in with the temporary password I've sent to your email.",
#         "public": True
#     },
#     {
#         "body": "Thank you for your feature request. We've added it to our product roadmap and will consider implementing it in a future release.",
#         "public": True
#     },
#     {
#         "body": "I've reviewed your invoice and found that there was an error in the calculation. I've issued a corrected invoice and applied a credit to your account. Please let me know if you have any questions.",
#         "public": True
#     }
# ]

# for i, comment in enumerate(comments):
#     comment['ticketId'] = ticket_ids[i]
#     comment['authorId'] = user_ids[i]
#     result = execute_mutation(comment_mutation, comment)
#     if result and 'data' in result and 'CreateTicketComment' in result['data']:
#         print(f"Created comment: {result['data']['CreateTicketComment']['id']}")
#     else:
#         print(f"Failed to create comment: {comment['body']}")
#         print(f"Result: {json.dumps(result, indent=2)}")

# print("Data creation completed successfully!")