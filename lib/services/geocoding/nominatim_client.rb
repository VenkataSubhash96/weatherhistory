# frozen_string_literal: true

module Services
  module Geocoding
    class NominatimClient
      include HTTParty
      base_uri 'https://nominatim.openstreetmap.org'
      headers 'User-Agent' => 'YourAppName/1.0 (you@example.com)', 'Accept' => 'application/json'

      def self.geocode(address)
        response = get('/search', query: { q: address, format: 'json', limit: 1 })
        return {} unless response.success?

        {
          latitude:  response.parsed_response.first['lat'],
          longitude: response.parsed_response.first['lon']
        }
      end
    end
  end
end