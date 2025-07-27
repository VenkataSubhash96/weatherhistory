# frozen_string_literal: true

module Services
  module Weather
    class FetchHistory
      def initialize(place:, start_date:, end_date:)
        @place = place
        @start_date = start_date
        @end_date = end_date
      end

      def call
        fetch_coordinates
        fetch_weather
      end

      private

      def fetch_weather
        response = Services::Geocoding::OpenMeteoClient.weather(
          latitude: @latitude,
          longitude: @longitude,
          start_date: @start_date,
          end_date: @end_date
        )
        return if response.empty?

        format_response(response)
      end

      def fetch_coordinates
        coordinates = Services::Geocoding::NominatimClient.geocode(@place)
        @latitude = coordinates[:latitude]
        @longitude = coordinates[:longitude]
      end

      def format_response(response)
        resultant_response = []
        daily_data = response['daily']
        daily_data['time'].each_with_index do |date, index|
          resultant_response.push({
            date: date,
            max: daily_data['temperature_2m_max'][index].to_f,
            min: daily_data['temperature_2m_min'][index].to_f
          })
        end
        resultant_response
      end
    end
  end
end