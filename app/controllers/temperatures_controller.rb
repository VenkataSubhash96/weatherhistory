class TemperaturesController < ApplicationController
  def show
    weather_service = Services::Weather::FetchHistory.new(
      place: params[:place],
      start_date: params[:start_date],
      end_date: params[:end_date]
    )

    render json: weather_service.call
  end
end
