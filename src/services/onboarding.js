import { supabase } from '../lib/supabase';

export const USER_LIFECYCLE = {
  CREATED: 'auth_account_created',
  CONFIRMED: 'email_confirmed',
  PROFILE_CREATED: 'profile_created',
  ONBOARDED: 'fully_onboarded'
};

export const onboardingService = {
  async createOrganization(name) {
    try {
      const { data: organization, error } = await supabase
        .from('organizations')
        .insert({ name })
        .select()
        .single();

      if (error) throw error;
      return { organization, error: null };
    } catch (error) {
      console.error('Error creating organization:', error);
      return { organization: null, error };
    }
  },

  // Updated createProfile function
  async createProfile(user) {
    try {
      const metadata = user.user_metadata;
      let organizationId = metadata?.organization_id;

      // Create organization and membership for admins
      if (metadata?.role === 'admin' && metadata?.organization_name) {
        const { organization, error } = await this.createOrganization(metadata.organization_name);
        if (error) throw error;
        
        // Create admin membership
        const { error: membershipError } = await supabase
          .from('user_organization_memberships')
          .insert({
            user_id: user.id,
            organization_id: organization.id,
            user_role: 'admin'
          });
        if (membershipError) throw membershipError;
        
        organizationId = organization.id;
      }
      // Create membership for customers who selected an organization
      else if (metadata?.role === 'customer' && metadata?.organization_id) {
        const { error: membershipError } = await supabase
          .from('user_organization_memberships')
          .insert({
            user_id: user.id,
            organization_id: metadata.organization_id,
            user_role: 'customer'
          });
        if (membershipError) throw membershipError;
        
        organizationId = metadata.organization_id;
      }

      // Create profile without organization_id or role
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: metadata?.full_name
        })
        .select()
        .single();

      if (error) throw error;
      return { profile, error: null };
    } catch (error) {
      console.error('Error creating profile:', error);
      return { profile: null, error };
    }
  },

  async handleNewUserConfirmation(user) {
    try {
      // Create profile for new user (with organization handling)
      const { profile, error } = await this.createProfile(user);
      if (error) throw error;

      return {
        status: USER_LIFECYCLE.ONBOARDED,
        profile
      };
    } catch (error) {
      console.error('Onboarding error:', error);
      return {
        status: USER_LIFECYCLE.CREATED,
        error: error.message
      };
    }
  }
}; 