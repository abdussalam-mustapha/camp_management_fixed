import axios from 'axios';
import { ConnectedAccount } from '../config/passport';

export interface TwitterMetrics {
  followers_count: number;
  following_count: number;
  tweet_count: number;
  listed_count: number;
  likes: number;
  retweets: number;
  replies: number;
}

export interface TwitterTweet {
  id: string;
  text: string;
  created_at: string;
  public_metrics: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    quote_count: number;
    impression_count: number;
  };
}

export class TwitterService {
  private static BASE_URL = 'https://api.twitter.com/2';

  static async getProfile(account: ConnectedAccount): Promise<any> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/users/me?user.fields=public_metrics,verified,created_at`,
        {
          headers: { Authorization: `Bearer ${account.accessToken}` }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch Twitter profile');
    }
  }

  static async getMetrics(account: ConnectedAccount): Promise<TwitterMetrics> {
    try {
      const profile = await this.getProfile(account);
      const metrics = profile.data.public_metrics;

      // Get recent tweets for engagement calculations
      const tweetsResponse = await axios.get(
        `${this.BASE_URL}/users/me/tweets?tweet.fields=public_metrics&max_results=100`,
        {
          headers: { Authorization: `Bearer ${account.accessToken}` }
        }
      );

      const tweets = tweetsResponse.data.data || [];
      let totalLikes = 0;
      let totalRetweets = 0;
      let totalReplies = 0;

      tweets.forEach((tweet: any) => {
        totalLikes += tweet.public_metrics.like_count || 0;
        totalRetweets += tweet.public_metrics.retweet_count || 0;
        totalReplies += tweet.public_metrics.reply_count || 0;
      });

      return {
        followers_count: metrics.followers_count || 0,
        following_count: metrics.following_count || 0,
        tweet_count: metrics.tweet_count || 0,
        listed_count: metrics.listed_count || 0,
        likes: totalLikes,
        retweets: totalRetweets,
        replies: totalReplies
      };
    } catch (error) {
      throw new Error('Failed to fetch Twitter metrics');
    }
  }

  static async getRecentTweets(account: ConnectedAccount, limit = 10): Promise<TwitterTweet[]> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/users/me/tweets?tweet.fields=public_metrics,created_at&max_results=${limit}`,
        {
          headers: { Authorization: `Bearer ${account.accessToken}` }
        }
      );

      return response.data.data || [];
    } catch (error) {
      throw new Error('Failed to fetch Twitter tweets');
    }
  }
}
