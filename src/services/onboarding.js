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

  async createProfile(user) {
    try {
      const metadata = user.user_metadata;
      let organizationId = metadata?.organization_id;

      // If admin role, create new organization
      if (metadata?.role === 'admin' && metadata?.organization_name) {
        const { organization, error } = await this.createOrganization(metadata.organization_name);
        if (error) throw error;
        organizationId = organization.id;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          role: metadata?.role || 'customer',
          full_name: metadata?.full_name,
          organization_id: organizationId
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