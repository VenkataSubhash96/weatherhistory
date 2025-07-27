# frozen_string_literal: true

module Services
  module Geocoding
    class OpenMeteoClient
      include HTTParty
      base_uri 'https://archive-api.open-meteo.com'

      def self.weather(params)
        response = get(
          '/v1/archive',
          query: {
            latitude: params[:latitude],
            longitude: params[:longitude],
            start_date: Date.parse(params[:start_date]).strftime("%Y-%m-%d"),
            end_date: Date.parse(params[:end_date]).strftime("%Y-%m-%d"),
            daily: 'temperature_2m_max,temperature_2m_min'
          }
        )
        return {} unless response.success?

        response.parsed_response
      end
    end
  end
end