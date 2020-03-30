select site_country, date_part('year', flight_date) as year, 
    count(*) as flight_count,
    count(distinct pilot_name) as pilot_count,
    round(min(flight_points)) as min,
    round(max(flight_points)) as max,
    round(sum(flight_points)) as sum,
    round(avg(flight_points)) as avg
from flights
where site_country = 'IR'
    and flight_points >= 50
group by 1, 2;

select site_country, date_part('year', flight_date) as year, 
    count(*) as flight_count,
    count(distinct pilot_name) as pilot_count,
    round(min(flight_points)) as min,
    round(max(flight_points)) as max,
    round(sum(flight_points)) as sum,
    round(avg(flight_points)) as avg
from flights
where site_country = 'IR'
    and flight_points >= 100
group by 1, 2;

select site_country, date_part('year', flight_date) as year, 
    count(*) as flight_count,
    count(distinct pilot_name) as pilot_count,
    round(min(flight_points)) as min,
    round(max(flight_points)) as max,
    round(sum(flight_points)) as sum,
    round(avg(flight_points)) as avg
from flights
where site_country = 'IR'
    and flight_points >= 200
group by 1, 2;

select site_country, date_part('month', flight_date) as month, 
    count(*) as flight_count,
    count(distinct pilot_name) as pilot_count,
    round(min(flight_points)) as min,
    round(max(flight_points)) as max,
    round(sum(flight_points)) as sum,
    round(avg(flight_points)) as avg
from flights
where site_country = 'IR'
    and flight_points >= 50
group by 1, 2;

select site_country, pilot_name, glider, flight_points
from flights
where site_country = 'IR'
order by flight_points desc
limit 19;

select site_country, pilot_name, glider, flight_points
from flights
where site_country = 'IR'
    and date_part('year', flight_date) = 2019
order by flight_points desc
limit 19;


select site_country, pilot_name, 
    count(*) filter (where flight_points >= 50) as flight_over_50,
    count(*) filter (where flight_points >= 100) as flight_over_100,
    count(*) filter (where flight_points >= 200) as flight_over_200
from flights
where site_country = 'IR'
group by 1, 2
order by 4 desc
limit 20;

select site_country, pilot_name, 
    count(*) filter (where flight_points >= 50) as flight_over_50,
    count(*) filter (where flight_points >= 100) as flight_over_100,
    count(*) filter (where flight_points >= 200) as flight_over_200
from flights
where site_country = 'IR'
    and date_part('year', flight_date) = 2019
group by 1, 2
order by 4 desc
limit 20;



with top6 as
    (
    select site_name, 
        count(*) as flight_count,
        count(distinct pilot_name) as pilot_count,
        round(min(flight_points)) as min,
        round(max(flight_points)) as max,
        round(sum(flight_points)) as sum,
        round(avg(flight_points)) as avg
    from flights
    where site_country = 'IR'
    --    and date_part('year', flight_date) = 2019
        and flight_points >= 50
    group by 1
    order by 2 desc
    limit 6
    )
select *
from top6
union all
select 'All other' as site_name,
        count(*) as flight_count,
        count(distinct pilot_name) as pilot_count,
        round(min(flight_points)) as min,
        round(max(flight_points)) as max,
        round(sum(flight_points)) as sum,
        round(avg(flight_points)) as avg
    from flights
    where site_country = 'IR'
    --    and date_part('year', flight_date) = 2019
        and flight_points >= 50
        and site_name not in (select site_name from top6)
;



with top6 as
    (
    select site_name, 
        count(*) as flight_count,
        count(distinct pilot_name) as pilot_count,
        round(min(flight_points)) as min,
        round(max(flight_points)) as max,
        round(sum(flight_points)) as sum,
        round(avg(flight_points)) as avg
    from flights
    where site_country = 'IR'
       and date_part('year', flight_date) = 2019
        and flight_points >= 50
    group by 1
    order by 2 desc
    limit 6
    )
select *
from top6
union all
select 'All other' as site_name,
        count(*) as flight_count,
        count(distinct pilot_name) as pilot_count,
        round(min(flight_points)) as min,
        round(max(flight_points)) as max,
        round(sum(flight_points)) as sum,
        round(avg(flight_points)) as avg
    from flights
    where site_country = 'IR'
       and date_part('year', flight_date) = 2019
        and flight_points >= 50
        and site_name not in (select site_name from top6)
;

select site_country, date_part('year', flight_date) as year, 
    count(*) filter (where site_name = 'Rokh') as flight_count_rokh,
    count(distinct pilot_name) filter (where site_name = 'Rokh') as pilot_count_rokh,
    round(min(flight_points) filter (where site_name = 'Rokh')) as min_rokh,
    round(max(flight_points) filter (where site_name = 'Rokh')) as max_rokh,
    round(sum(flight_points) filter (where site_name = 'Rokh')) as sum_rokh,
    round(avg(flight_points) filter (where site_name = 'Rokh')) as avg_rokh,
    count(*) filter (where site_name = 'Veis Kermanshah') as flight_count_veis,
    count(distinct pilot_name) filter (where site_name = 'Veis Kermanshah') as pilot_count_veis,
    round(min(flight_points) filter (where site_name = 'Veis Kermanshah')) as min_veis,
    round(max(flight_points) filter (where site_name = 'Veis Kermanshah')) as max_veis,
    round(sum(flight_points) filter (where site_name = 'Veis Kermanshah')) as sum_veis,
    round(avg(flight_points) filter (where site_name = 'Veis Kermanshah')) as av_veisg
from flights
where site_country = 'IR'
    and flight_points >= 50
group by 1, 2
order by 2
;

/*

select flight_points, * 
from flights
where site_country = 'IR'
    and date_part('year', flight_date) = 2019
    and pilot_name = 'reza kaviani'
order by flight_points desc
limit 21;


select pilot_name, flight_date::date::text, count(*)
from flights
group by 1, 2
having count(*) > 1
limit 10;


-- duplicate flights

with d as (
    select pilot_name, flight_date::date, count(*) as qty
    from flights
    group by 1, 2
    having count(*) > 1
), b as (
    select f.id, f.pilot_name, f.flight_date::date, created_at, row_number() over (partition by f.pilot_name, f.flight_date::date order by f.created_at desc) as rowno
    from flights f
    inner join d on f.pilot_name = d.pilot_name and f.flight_date::date = d.flight_date::date
)
select pilot_name, flight_date::text from b limit 10;
select site_country, date_part('year', flight_date) as year, count(*), sum(flight_points)
from flights
where id in (select id from b where rowno != 1) 
    and site_country = 'IR'
group by 1, 2;


start transaction;

with d as (
    select pilot_name, flight_date::date, count(*) as qty
    from flights
    group by 1, 2
    having count(*) > 1
), b as (
    select f.id, f.pilot_name, f.flight_date::date, created_at, row_number() over (partition by f.pilot_name, f.flight_date::date order by f.created_at desc, flight_id desc) as rowno
    from flights f
    inner join d on f.pilot_name = d.pilot_name and f.flight_date::date = d.flight_date::date
)
delete from flights where id in (select id from b where rowno != 1);


commit;
*/